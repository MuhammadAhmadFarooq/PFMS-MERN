import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, InputNumber, notification, Card, Statistic, DatePicker, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import './revenue.css';
import { api } from '../../services/api';
import moment from 'moment';

interface RevenueRecord {
  _id: string;
  date: string;
  source: 'Egg Sales' | 'Manure Sales' | 'Other';
  amount: number;
  description: string;
  buyer: {
    name: string;
    contact: string;
  };
  createdAt: string;
}

const Revenue = () => {
  const [data, setData] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RevenueRecord | null>(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    eggSalesRevenue: 0,
    manureSalesRevenue: 0,
    otherRevenue: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/revenues', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setData(data.data);
      calculateStatistics(data.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch revenue data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStatistics = (revenueData: RevenueRecord[]) => {
    const totalRevenue = revenueData.reduce((sum, record) => sum + record.amount, 0);
    const eggSalesRevenue = revenueData
      .filter(record => record.source === 'Egg Sales')
      .reduce((sum, record) => sum + record.amount, 0);
    const manureSalesRevenue = revenueData
      .filter(record => record.source === 'Manure Sales')
      .reduce((sum, record) => sum + record.amount, 0);
    const otherRevenue = revenueData
      .filter(record => record.source === 'Other')
      .reduce((sum, record) => sum + record.amount, 0);

    setStatistics({
      totalRevenue,
      eggSalesRevenue,
      manureSalesRevenue,
      otherRevenue
    });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: RevenueRecord, b: RevenueRecord) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: 'Amount ($)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toFixed(2)}`,
      sorter: (a: RevenueRecord, b: RevenueRecord) => a.amount - b.amount
    },
    {
      title: 'Buyer',
      dataIndex: ['buyer', 'name'],
      key: 'buyerName'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RevenueRecord) => (
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

  const handleEdit = (record: RevenueRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/revenues/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      notification.success({
        message: 'Success',
        description: 'Revenue record deleted successfully'
      });
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete revenue record'
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/revenues/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'text/csv',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revenue-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to export revenue data'
      });
    }
  };

  const handleSave = async (values: any) => {
    try {
      const formData = {
        ...values,
        date: values.date.format('YYYY-MM-DD')
      };

      if (editingRecord) {
        await fetch(`http://localhost:4000/api/revenues/${editingRecord._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:4000/api/revenues/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData)
        });
      }

      notification.success({
        message: 'Success',
        description: `Revenue ${editingRecord ? 'updated' : 'added'} successfully`
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to save revenue record'
      });
    }
  };

  return (
    <MainLayout>
      <div className="revenue-container">
        <div className="revenue-header">
          <h1>Revenue Management</h1>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Revenue
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
            <Statistic 
              title="Total Revenue" 
              value={statistics.totalRevenue} 
              prefix="$"
            />
          </Card>
          <Card>
            <Statistic 
              title="Egg Sales Revenue" 
              value={statistics.eggSalesRevenue} 
              prefix="$"
            />
          </Card>
          <Card>
            <Statistic 
              title="Manure Sales Revenue" 
              value={statistics.manureSalesRevenue} 
              prefix="$"
            />
          </Card>
          <Card>
            <Statistic 
              title="Other Revenue" 
              value={statistics.otherRevenue} 
              prefix="$"
            />
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
          title={editingRecord ? 'Edit Revenue' : 'Add Revenue'}
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
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="source"
              label="Source"
              rules={[{ required: true, message: 'Please select source!' }]}
            >
              <Select>
                <Select.Option value="Egg Sales">Egg Sales</Select.Option>
                <Select.Option value="Manure Sales">Manure Sales</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount ($)"
              rules={[{ required: true, message: 'Please input amount!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                precision={2}
              />
            </Form.Item>

            <Form.Item
              name={['buyer', 'name']}
              label="Buyer Name"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={['buyer', 'contact']}
              label="Buyer Contact"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Revenue;
