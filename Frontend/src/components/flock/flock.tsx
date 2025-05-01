import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, Select, notification, Card, Statistic } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import './flock.css';
import { api } from '../../services/api';

interface FlockRecord {
  _id: string;
  name: string;
  breed: string;
  numberOfHens: number;
  healthStatus: 'Healthy' | 'Sick' | 'Quarantined';
  vaccinationRecords: string[];
  mortalityRecords: string[];
  createdAt: string;
}

const Flock = () => {
  const [data, setData] = useState<FlockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FlockRecord | null>(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalHens: 0,
    healthyFlocks: 0,
    sickFlocks: 0,
    quarantinedFlocks: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/flock', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setData(data);
      calculateStatistics(data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch flock data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStatistics = (flockData: FlockRecord[]) => {
    const totalHens = flockData.reduce((sum, flock) => sum + flock.numberOfHens, 0);
    const healthyFlocks = flockData.filter(flock => flock.healthStatus === 'Healthy').length;
    const sickFlocks = flockData.filter(flock => flock.healthStatus === 'Sick').length;
    const quarantinedFlocks = flockData.filter(flock => flock.healthStatus === 'Quarantined').length;

    setStatistics({
      totalHens,
      healthyFlocks,
      sickFlocks,
      quarantinedFlocks
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: FlockRecord, b: FlockRecord) => a.name.localeCompare(b.name)
    },
    {
      title: 'Breed',
      dataIndex: 'breed',
      key: 'breed'
    },
    {
      title: 'Number of Hens',
      dataIndex: 'numberOfHens',
      key: 'numberOfHens',
      sorter: (a: FlockRecord, b: FlockRecord) => a.numberOfHens - b.numberOfHens
    },
    {
      title: 'Health Status',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (status: string) => {
        const color = {
          Healthy: 'green',
          Sick: 'red',
          Quarantined: 'orange'
        }[status];
        return <span style={{ color }}>{status}</span>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FlockRecord) => (
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
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: FlockRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/flock/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      notification.success({
        message: 'Success',
        description: 'Flock deleted successfully'
      });
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete flock'
      });
    }
  };

  const handleSave = async (values: any) => {
    const flockId = editingRecord?._id;
    const flockData = {
      name: values.name,
      breed: values.breed,
      numberOfHens: values.numberOfHens,
      healthStatus: values.healthStatus
    };
    try {
      if (flockId) {
        await fetch(`http://localhost:4000/api/flock/${flockId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
          body: JSON.stringify(flockData)
        });
      } else {
        await fetch('http://localhost:4000/api/flock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
          body: JSON.stringify(flockData)
        });
      }

      notification.success({
        message: 'Success',
        description: `Flock ${editingRecord ? 'updated' : 'created'} successfully`
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to save flock'
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/flock/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flock-data.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to export flock data',
      });
    }
  };

  return (
    <MainLayout>
      <div className="flock-container">
        <div className="flock-header">
          <h1>Flock Management</h1>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Flock
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="statistics-cards">
          <Card>
            <Statistic title="Total Hens" value={statistics.totalHens} />
          </Card>
          <Card>
            <Statistic title="Healthy Flocks" value={statistics.healthyFlocks} />
          </Card>
          <Card>
            <Statistic title="Sick Flocks" value={statistics.sickFlocks} />
          </Card>
          <Card>
            <Statistic title="Quarantined Flocks" value={statistics.quarantinedFlocks} />
          </Card>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />

        <Modal
          title={editingRecord ? 'Edit Flock' : 'Add New Flock'}
          open={isModalVisible}
          onOk={() => form.validateFields().then(handleSave).catch(() => {})}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingRecord(null);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            onFinish={handleSave}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Flock Name"
              rules={[{ required: true, message: 'Please input flock name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="breed"
              label="Breed"
              rules={[{ required: true, message: 'Please input breed!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="numberOfHens"
              label="Number of Hens"
              rules={[{ required: true, message: 'Please input number of hens!' }]}
            >
              <Input type="number" min={0} />
            </Form.Item>

            <Form.Item
              name="healthStatus"
              label="Health Status"
              rules={[{ required: true, message: 'Please select health status!' }]}
            >
              <Select>
                <Select.Option value="Healthy">Healthy</Select.Option>
                <Select.Option value="Sick">Sick</Select.Option>
                <Select.Option value="Quarantined">Quarantined</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Flock; 