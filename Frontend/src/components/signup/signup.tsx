import { useState } from 'react';
import { MailOutlined } from '@ant-design/icons';
import { Input, Button, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import img from "../../assets/logo.png";
import img2 from "../../assets/Illustration2.png";
import "./signup.css";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      notification.error({
        message: 'Error',
        description: 'Passwords do not match',
      });
      return;
    }

    const signupData = { username, email, password };

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);

        notification.success({
          message: 'Signup Successful',
          description: 'You have successfully signed up!',
        });
        navigate('/dashboard'); // Redirect to dashboard (if dashboard doesn't work, use user-dashboard)
      } else {
        notification.error({
          message: 'Signup Failed',
          description: result.message || 'Something went wrong!',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error occurred',
        description: 'Failed to connect to the server. Please try again later.',
      });
    }
  };

  return (
    <>
      <div className="navbar-logo-and-name">    
        <img className='logo' src={img}/>    
        <h1>Poultry Farm Management System</h1>
      </div>

      <div className='signup-and-image'>
        <div className='signup'>
          <div>
            <h1 className='welcome-message1'>Signup</h1>
            <p className='welcome-message2'>Welcome to our community</p>

            <div className='form'>
              <div>
                <p>Username</p>
                <Input
                  className='input-box'
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <p>Email</p>
                <Input
                  className='input-box'
                  placeholder="test@gmail.com"
                  suffix={<MailOutlined />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <p>Password</p>
                <Input.Password
                  className='input-box'
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <p>Confirm Password</p>
                <Input.Password
                  className='input-box'
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button className='signup-button' onClick={handleSignup}>Signup</Button>

            <div className='signup-acc'>
              <p className='already-have-acc'>Already have an account?</p>
              <Link className='links' to='/'>Login</Link>
            </div>
          </div>
        </div>

        <div className='image'>
          <img src={img2} alt="Signup illustration" />
        </div>
      </div>
      {contextHolder}
    </>
  );
};

export default Signup;
