import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import MainLayout from '../mainfile/main';
import { Button, Select, Table, DatePicker, Modal, Form, Input, InputNumber, notification, Card, Statistic } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import './egg-production.css';
import moment from 'moment';
import { api } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EggProductionRecord {
    _id: string;
    date: string;
    totalEggs: number;
    notes: string;
}

const EggProduction = () => {
    const [data, setData] = useState<EggProductionRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EggProductionRecord | null>(null);
    const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
    const [statistics, setStatistics] = useState({
        totalEggs: 0,
        averageDaily: 0,
        highestProduction: 0,
        lowestProduction: 0
    });
    const [form] = Form.useForm();

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.fetchWithAuth('/egg-production');
            setData(result.data);
            calculateStatistics(result.data);
        } catch (err) {
            setError('Failed to fetch egg production data');
            notification.error({
                message: 'Error',
                description: 'Failed to fetch egg production data'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate statistics
    const calculateStatistics = (productionData: EggProductionRecord[]) => {
        const total = productionData.reduce((sum, record) => sum + record.totalEggs, 0);
        const average = total / productionData.length || 0;
        const highest = Math.max(...productionData.map(record => record.totalEggs));
        const lowest = Math.min(...productionData.map(record => record.totalEggs));

        setStatistics({
            totalEggs: total,
            averageDaily: Math.round(average),
            highestProduction: highest,
            lowestProduction: lowest
        });
    };

    // Modal handlers
    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: EggProductionRecord) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            date: moment(record.date)
        });
        setIsModalVisible(true);
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        const eggProductionData = { date: values.date.format('YYYY-MM-DD'), totalEggs: values.totalEggs, notes: values.notes};
        try {
            // Check if date is defined
            if (!values.date) {
                notification.error({
                    message: 'Error',
                    description: 'Please select a date.',
                });
                return; // Exit the function if date is not selected
            }

            const response = await fetch('http://localhost:4000/api/egg-production', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(eggProductionData),
            });

            const data = await response.json();

            // Log the response from the backend
            console.log('Response from backend:', data);

            if (data.success) {
                notification.success({
                    message: 'Success',
                    description: 'Production record added and inventory updated successfully',
                });
                setIsModalVisible(false);
                form.resetFields();
                fetchData(); // Refresh production data
            } else {
                notification.error({
                    message: 'Error',
                    description: data.message || 'Failed to save record',
                });
            }
        } catch (error) {
            console.error('Error during save operation:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to save record',
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete handler
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:4000/api/egg-production/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({
                    message: 'Success',
                    description: 'Record deleted successfully'
                });
                fetchData();
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to delete record'
            });
        }
    };

    // Export handler
    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/egg-production/export', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'egg-production.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to export data'
            });
        }
    };

    // Chart data preparation
    const chartData = {
        labels: data.map(record => moment(record.date).format('MMM DD')),
        datasets: [{
            label: 'Daily Egg Production',
            data: data.map(record => record.totalEggs),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Table columns
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => moment(date).format('YYYY-MM-DD'),
            sorter: (a: EggProductionRecord, b: EggProductionRecord) => 
                moment(a.date).unix() - moment(b.date).unix()
        },
        {
            title: 'Total Eggs',
            dataIndex: 'totalEggs',
            key: 'totalEggs',
            sorter: (a: EggProductionRecord, b: EggProductionRecord) => 
                a.totalEggs - b.totalEggs
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: EggProductionRecord) => (
                <>
                    <Button 
                        icon={<EditOutlined />} 
                        type="link" 
                        onClick={() => handleEdit(record)} 
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        type="link" 
                        danger 
                        onClick={() => handleDelete(record._id)}
                    />
                </>
            ),
        }
    ];

    return (
        <MainLayout>
            <div className="production-title-primary">
                <h1 className="production-title">Egg Production</h1>
                <div className="action-buttons">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAdd}
                    >
                        Add Record
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
                    <Statistic title="Total Eggs" value={statistics.totalEggs} />
                </Card>
                <Card>
                    <Statistic title="Daily Average" value={statistics.averageDaily} />
                </Card>
                <Card>
                    <Statistic title="Highest Production" value={statistics.highestProduction} />
                </Card>
                <Card>
                    <Statistic title="Lowest Production" value={statistics.lowestProduction} />
                </Card>
            </div>

            <div className="filters">
                <DatePicker.RangePicker 
                    className="filters-select"
                    onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
                />
            </div>

            <div className="chart-container">
                <Line data={chartData} options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Daily Egg Production Trend' }
                    }
                }} />
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
                title={editingRecord ? 'Edit Record' : 'Add New Record'}
                open={isModalVisible}
                onOk={() => form.validateFields().then(handleSave).catch(() => {})}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker onChange={(date) => form.setFieldsValue({ date })} />
                    </Form.Item>
                    <Form.Item
                        name="totalEggs"
                        label="Total Eggs"
                        rules={[{ required: true, message: 'Please enter total eggs' }]}
                    >
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default EggProduction; 