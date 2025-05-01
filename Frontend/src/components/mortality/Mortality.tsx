import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, InputNumber, notification, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import moment from 'moment';

interface MortalityRecord {
  _id: string;
  flock: string;
  date: string;
  numberOfDeaths: number;
  cause: string;
  createdAt: string;
}

interface FlockOption {
  _id: string;
  flockId: string;
  name: string;
}

const Mortality = () => {
  const [data, setData] = useState<MortalityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchFlocks = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/flock', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFlocks(data);
      if (data.length > 0) {
        setSelectedFlock(data[0]._id);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch flocks'
      });
    }
  };

  const fetchMortalityData = async () => {
    if (!selectedFlock) return;
    
    console.log('Fetching mortality data for flock:', selectedFlock);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/mortality/${selectedFlock}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      console.log('Fetched Mortality Data:', data);
      if (data.data) {
        setData(data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch mortality data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  useEffect(() => {
    if (selectedFlock) {
      fetchMortalityData();
    }
  }, [selectedFlock]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: MortalityRecord, b: MortalityRecord) => 
        moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Number of Deaths',
      dataIndex: 'numberOfDeaths',
      key: 'numberOfDeaths',
      sorter: (a: MortalityRecord, b: MortalityRecord) => 
        a.numberOfDeaths - b.numberOfDeaths
    },
    {
      title: 'Cause',
      dataIndex: 'cause',
      key: 'cause'
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      date: moment()
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = {
        flockId: selectedFlock,
        date: values.date.format('YYYY-MM-DD'),
        numberOfDeaths: values.numberOfDeaths,
        cause: values.cause
      };

      if (values.date.isAfter(moment())) {
        throw new Error('Cannot record mortality for future dates');
      }

      await fetch('http://localhost:4000/api/mortality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData)
      });

      notification.success({
        message: 'Success',
        description: 'Mortality record added successfully'
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchMortalityData();
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to save mortality record'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mortality-container">
        <div className="mortality-header">
          <div className="header-content">
            <h1>Mortality Tracking</h1>
            <div className="mortality-controls">
              <Select
                className="flock-selector"
                value={selectedFlock}
                onChange={setSelectedFlock}
                placeholder="Select Flock"
              >
                {flocks.map(flock => (
                  <Select.Option key={flock._id} value={flock._id}>
                    {flock.name || flock.flockId}
                  </Select.Option>
                ))}
              </Select>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                disabled={!selectedFlock}
              >
                Add Record
              </Button>
            </div>
          </div>
        </div>

        <div className="mortality-table">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
          />
        </div>

        <Modal
          title="Add Mortality Record"
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            Modal.confirm({
              title: 'Confirm',
              content: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
              onOk: () => {
                setIsModalVisible(false);
                form.resetFields();
              }
            });
          }}
          confirmLoading={submitting}
          maskClosable={false}
        >
          <Form
            form={form}
            onFinish={handleSave}
            layout="vertical"
            className="add-record-form"
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[
                { required: true, message: 'Please select date!' },
                {
                  validator: (_, value) => {
                    if (value && value.isAfter(moment())) {
                      return Promise.reject('Cannot select future dates');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={current => current && current > moment().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="numberOfDeaths"
              label="Number of Deaths"
              rules={[{ required: true, message: 'Please input number of deaths!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={1}
                precision={0}
              />
            </Form.Item>

            <Form.Item
              name="cause"
              label="Cause"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Mortality; 