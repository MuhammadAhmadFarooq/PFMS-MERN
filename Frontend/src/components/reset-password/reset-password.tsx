import {MailOutlined } from '@ant-design/icons';
import {Input,Button } from 'antd';
import { Link } from 'react-router-dom';
import img from "../../assets/logo.png"
import img2 from "../../assets/Illustration3.png"
import "./reset-password.css";

const Resetpassword = () => {

  return (
    <>
    <div className="navbar-logo-and-name">    
        <img className='logo' src={img}/>    
        <h1>Poultry Farm Management System</h1>
    </div>

    <div className='reset-password-and-image'>
        <div className='reset-password-page'>
            <h1 className='welcome-message1'>Reset Password</h1>
            <p className='welcome-message2' >Enter your email for reset link</p>

            
            <div className='email'>
                <p>Email</p>
                <Input className='input-box' variant='filled' placeholder="test@gmail.com" suffix={<MailOutlined/>} />
            </div>

            <Button className='reset-password-button'>Send Reset Password Link</Button>

            <div className='signup-acc'>
                <p className='dont-have-acc'>Don't have an account?</p>
                <Link className='links' to='/signup'>Sign up</Link>
            </div>
        </div>

        <div>
            <img src={img2}/>
        </div>
    </div>
    </>
  );
};

export default Resetpassword;
