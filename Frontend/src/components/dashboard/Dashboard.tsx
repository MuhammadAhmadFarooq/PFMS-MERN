import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Row, Col, Card, Statistic, Alert, Table, notification } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import { Line } from '@ant-design/charts';

import './dashboard.css';

interface DashboardData {
  totalEggsProduced: number;
  totalMortality: number;
  totalFeedUsed: number;
  totalEggsInInventory: number;
  totalProfits: number;
  revenueTrends: any[];
  expenseTrends: any[];
  revenueBreakdown: any[];
  expenseBreakdown: any[];
  alerts: {
    lowFeed: boolean;
    highMortality: boolean;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/user-dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  // Revenue vs Expense Chart Configuration
  const trendConfig = {
    data: [...data.revenueTrends, ...data.expenseTrends].map(item => ({
      month: `${item._id.year}-${item._id.month}`,
      amount: item.total,
      type: item.total === data.revenueTrends.find(r => 
        r._id.year === item._id.year && r._id.month === item._id.month
      )?.total ? 'Revenue' : 'Expense'
    })),
    xField: 'month',
    yField: 'amount',
    seriesField: 'type',
    smooth: true,
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        {/* Alerts Section */}
        {(data.alerts.lowFeed || data.alerts.highMortality) && (
          <div className="alerts-section">
            {data.alerts.lowFeed && (
              <Alert
                message="Low Feed Alert"
                description="Feed stock is running low. Please restock soon."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            )}
            {data.alerts.highMortality && (
              <Alert
                message="High Mortality Alert"
                description="Unusually high mortality rate detected."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            )}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="statistics-cards">
          <Card>
            <Statistic
              title="Total Eggs Produced"
              value={data.totalEggsProduced}
              suffix="eggs"
            />
          </Card>
          <Card>
            <Statistic
              title="Eggs in Inventory"
              value={data.totalEggsInInventory}
              suffix="eggs"
            />
          </Card>
          <Card>
            <Statistic
              title="Total Feed Used"
              value={data.totalFeedUsed}
              suffix="kg"
            />
          </Card>
          <Card>
            <Statistic
              title="Mortality Rate"
              value={data.totalMortality}
              suffix="birds"
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

        {/* Revenue vs Expense Trend Chart */}
        <Card title="Revenue vs Expense Trends" className="chart-card">
          <Line {...trendConfig} />
        </Card>

        {/* Breakdowns */}
        <Row gutter={16} className="breakdown-section">
          <Col span={12}>
            <Card title="Revenue Breakdown">
              <Table
                dataSource={data.revenueBreakdown}
                columns={[
                  { title: 'Source', dataIndex: '_id', key: 'source' },
                  { 
                    title: 'Amount', 
                    dataIndex: 'total', 
                    key: 'amount',
                    render: (value: number) => `$${value.toFixed(2)}`
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Expense Breakdown">
              <Table
                dataSource={data.expenseBreakdown}
                columns={[
                  { title: 'Type', dataIndex: '_id', key: 'type' },
                  { 
                    title: 'Amount', 
                    dataIndex: 'total', 
                    key: 'amount',
                    render: (value: number) => `$${value.toFixed(2)}`
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Dashboard; 