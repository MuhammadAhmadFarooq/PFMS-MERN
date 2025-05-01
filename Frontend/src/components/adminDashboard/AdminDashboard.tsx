import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Card, Statistic, notification } from 'antd';
import { api } from '../../services/api';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './adminDashboard.css';

interface AdminDashboardData {
  totalUsers: number;
  totalProfits: number;
  totalEggsProduced: number;
}

const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin-dashboard/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.data) {
        setData(data.data);
      } else {
        setData(null);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch admin dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <MainLayout>
      <div className="admin-dashboard-container">
        <h1>Admin Dashboard</h1>

        <div className="statistics-cards">
          <Card>
            <Statistic
              title="Total Users"
              value={data.totalUsers}
            />
          </Card>
          <Card>
            <Statistic
              title="Total Eggs Produced"
              value={data.totalEggsProduced}
              suffix="eggs"
            />
          </Card>
          <Card>
            <Statistic
              title="Total Profits"
              value={data.totalProfits}
              valueStyle={{ color: data.totalProfits >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={data.totalProfits >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard; 