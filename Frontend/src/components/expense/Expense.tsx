import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, InputNumber, notification, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import moment from 'moment';
import './expense.css';

interface ExpenseRecord {
  _id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
}

const Expense = () => {
  const [data, setData] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.data) {
        setData(data.data);
      }
      else {
        setData([]);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch expenses'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: ExpenseRecord, b: ExpenseRecord) => 
        moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
      sorter: (a: ExpenseRecord, b: ExpenseRecord) => a.amount - b.amount
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExpenseRecord) => (
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
      date: moment()
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: ExpenseRecord) => {
    form.setFieldsValue({
      ...record,
      date: moment(record.date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      notification.success({
        message: 'Success',
        description: 'Expense record deleted successfully'
      });
      fetchExpenses();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete expense record'
      });
    }
  };

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = {
        type: values.type.trim(),
        amount: values.amount,
        date: values.date.format('YYYY-MM-DD'),
        description: values.description?.trim()
      };

      if (form.getFieldValue('_id')) {
        await fetch(`http://localhost:4000/api/expenses/${form.getFieldValue('_id')}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:4000/api/expenses/add', {
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
        description: `Expense record ${form.getFieldValue('_id') ? 'updated' : 'added'} successfully`
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchExpenses();
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to save expense record'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="expense-container">
        <div className="expense-header">
          <h1>Expense Management</h1>
          <div className="expense-controls">
            <div className="control-wrapper">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        <div className="expense-table">
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
          title="Add Expense Record"
          open={isModalVisible}
          onOk={() => form.validateFields().then(handleSave).catch(() => {})}
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
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please input expense type!' }]}
            >
              <Input placeholder="e.g., Feed, Labor, Equipment" />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please input amount!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                prefix="$"
              />
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

export default Expense; 