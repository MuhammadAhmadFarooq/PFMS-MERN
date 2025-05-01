import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, notification, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import moment from 'moment';
import './vaccination.css';

interface VaccinationRecord {
  _id: string;
  flock: string;
  vaccineType: string;
  administrationDate: string;
  notes: string;
  createdAt: string;
}

interface FlockOption {
  _id: string;
  flockId: string;
  name: string;
}

const Vaccination = () => {
  const [data, setData] = useState<VaccinationRecord[]>([]);
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

  const fetchVaccinationData = async () => {
    if (!selectedFlock) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/vaccinations/${selectedFlock}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setData(data.vaccinations);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch vaccination data'
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
      fetchVaccinationData();
    }
  }, [selectedFlock]);

  const columns = [
    {
      title: 'Administration Date',
      dataIndex: 'administrationDate',
      key: 'administrationDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: VaccinationRecord, b: VaccinationRecord) => 
        moment(a.administrationDate).unix() - moment(b.administrationDate).unix()
    },
    {
      title: 'Vaccine Type',
      dataIndex: 'vaccineType',
      key: 'vaccineType',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: VaccinationRecord) => (
        <div className="action-buttons">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </div>
      )
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      administrationDate: moment()
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: VaccinationRecord) => {
    form.setFieldsValue({
      ...record,
      administrationDate: moment(record.administrationDate)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/vaccinations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      notification.success({
        message: 'Success',
        description: 'Vaccination record deleted successfully'
      });
      fetchVaccinationData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete vaccination record'
      });
    }
  };

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = {
        flockId: selectedFlock,
        vaccineType: values.vaccineType.trim(),
        administrationDate: values.administrationDate.format('YYYY-MM-DD'),
        notes: values.notes?.trim()
      };

      if (values.administrationDate.isAfter(moment())) {
        throw new Error('Cannot record vaccination for future dates');
      }

      await fetch('http://localhost:4000/api/vaccinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData)
      });

      notification.success({
        message: 'Success',
        description: 'Vaccination record added successfully'
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchVaccinationData();
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to save vaccination record'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="vaccination-container">
        <div className="vaccination-header">
          <div className="header-content">
            <h1>Vaccination Records</h1>
            <div className="vaccination-controls">
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
                Add Vaccination
              </Button>
            </div>
          </div>
        </div>

        <div className="vaccination-table">
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
          title="Add Vaccination Record"
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
              name="administrationDate"
              label="Administration Date"
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
              name="vaccineType"
              label="Vaccine Type"
              rules={[{ required: true, message: 'Please input vaccine type!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Vaccination; 