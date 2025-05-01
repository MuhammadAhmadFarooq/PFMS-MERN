import { useState } from 'react';
import { Layout, Menu, Button, Alert, Space, notification } from 'antd';
import { FundOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, SmileOutlined, BellOutlined, DatabaseOutlined, InboxOutlined , ShoppingOutlined, TeamOutlined, DollarOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './main.css';
import logo from '../../assets/logo.png';
import image1 from '../../assets/avatar.png'

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();

  const openNotification = () => {
    api.open({
      message: 'Notification Title',
      description:
        'Add object here',
        icon: <SmileOutlined style={{ color: 'lightBlue' }} />,
    });
  };

  const openProfile = () => {
    const userEmail = localStorage.getItem('email');
    api.open({
      message: userEmail || 'No email found',
      icon: <UserOutlined style={{color:"lightBlue"}}/>,
    });
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogoutClick = () => {
    setShowAlert(true);
  };

  const handleAccept = () => {
    setShowAlert(false);
    navigate('/login');
  };

  const handleDecline = () => {
    setShowAlert(false);
  };

  const items = [
    {
      key: 'adminDashboard',
      icon: <FundOutlined />,
      label: <Link to="/admin/dashboard">Admin Dashboard</Link>,
      onClick: () => navigate('/admin/dashboard')
    },
    
    {
      key: 'dashboard',
      icon: <FundOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '1',
      icon: <DatabaseOutlined />,
      label: <Link to="/egg-production">Egg Production</Link>,
    },
    {
      key: '2',
      icon: <InboxOutlined />,
      label: <Link to="/egg-inventory">Egg Inventory</Link>,
    },
    {
      key: '3',
      icon: <DatabaseOutlined />,
      label: <Link to="/feed">Feed</Link>,
    },
    {
      key: '4',
      icon: <TeamOutlined />,
      label: <Link to="/flock">Flock</Link>,
    },
    {
      key: '5',
      icon: <DollarOutlined />,
      label: <Link to="/revenue">Revenue</Link>,
    },
    {
      key: '6',
      icon: <DatabaseOutlined />,
      label: <Link to="/mortality">Mortality</Link>,
    },
    {
      key: '7',
      icon: <MedicineBoxOutlined />,
      label: <Link to="/vaccination">Vaccination</Link>,
    },
    {
      key: 'expenses',
      icon: <DollarOutlined />,
      label: 'Expenses',
      onClick: () => navigate('/expenses')
    },
    {
      key: '8',
      icon: <LogoutOutlined />,
      label: <p onClick={handleLogoutClick}>Logout</p>
    }
  ];

  return (
    <Layout className="layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <img className="sider-logo" src={logo} alt="Logo" />
        <Menu
          className="menu-layout"
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="toggle-button"
          />
          <div className='notification-profile'>
            {contextHolder}
            <Button 
                type="text"
                icon={<BellOutlined/>} 
                onClick={openNotification}> 
            </Button>
            <Button 
                type="text"
                icon={<img className='profile-image' src={image1}/>} 
                onClick={openProfile}> 
            </Button>
          </div>
        </Header>
        <Content className="content">
          {showAlert && (
            <Alert className='alert-for-logout'
              message="Logout Confirmation"
              description="Are you sure you want to log out?"
              type="info"
              action={
                <Space direction="vertical">
                  <Button size="small" type="primary" onClick={handleAccept}>
                    Accept
                  </Button>
                  <Button size="small" danger ghost onClick={handleDecline}>
                    Decline
                  </Button>
                </Space>
              }
              closable
              onClose={handleDecline}
            />
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
