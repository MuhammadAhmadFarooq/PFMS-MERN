import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, InputNumber, notification, Card, Statistic } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './egg-inventory.css';
import { api } from '../../services/api';
import moment from 'moment';

interface EggInventoryRecord {
    _id: string;
    soldEggs: Array<{
        buyer: {
            name: string;
            contact: string;
        };
        quantity: number;
        saleDate: string;
    }>;
    remainingEggs: number;
    updatedAt: string;
}

const EggInventory = () => {
    const [data, setData] = useState<EggInventoryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await fetch    ('http://localhost:4000/api/egg-inventory', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to fetch inventory data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: EggInventoryRecord) => {
        form.setFieldsValue({
            // Remove totalEggs from here
        });
        setIsModalVisible(true);
    };

    const handleSave = async (values: any) => {
        const eggInventoryData = { buyer: values.buyer, quantity: values.quantity, saleDate: values.saleDate };
        try {

            const response = await fetch('http://localhost:4000/api/egg-inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(eggInventoryData)
            });

            if (response.ok) {
                notification.success({
                    message: 'Success',
                    description: 'Inventory updated successfully'
                });
                setIsModalVisible(false);
                form.resetFields();
                fetchInventory();
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to update inventory'
            });
        }
    };

    const columns = [
        {
            title: 'Remaining Eggs',
            dataIndex: 'remainingEggs',
            key: 'remainingEggs',
            sorter: (a: EggInventoryRecord, b: EggInventoryRecord) => a.remainingEggs - b.remainingEggs
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: EggInventoryRecord, b: EggInventoryRecord) => 
                moment(a.updatedAt).unix() - moment(b.updatedAt).unix()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: EggInventoryRecord) => (
                <div className="action-buttons">
                    <Button 
                        icon={<EditOutlined />} 
                        type="link" 
                        onClick={() => handleEdit(record)}
                    />
                </div>
            )
        }
    ];

    return (
        <MainLayout>
            <div className="inventory-title-primary">
                <h1 className="inventory-title">Egg Inventory</h1>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalVisible(true)}
                >
                    Add Sale Record
                </Button>
            </div>

            <div className="statistics-cards">
                <Card>
                    <Statistic 
                        title="Available Eggs" 
                        value={data.reduce((sum, record) => sum + record.remainingEggs, 0)} 
                    />
                </Card>
            </div>

            <Table 
                columns={columns} 
                dataSource={data}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                title="Add Sale Record"
                open={isModalVisible}
                onOk={() => form.validateFields().then(handleSave).catch(() => {})}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form 
                    form={form} 
                    layout="vertical"
                    onFinish={handleSave}
                >
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
                        name="quantity"
                        label="Quantity Sold"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default EggInventory; 