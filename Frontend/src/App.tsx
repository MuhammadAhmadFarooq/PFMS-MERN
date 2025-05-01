import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/login';
import Signup from './components/signup/signup';
import Resetpassword from './components/reset-password/reset-password';
import EggProduction from './components/egg-production/egg-production';
import EggInventory from './components/egg-inventory/egg-inventory';
import Feed from './components/feed/feed';
import Flock from './components/flock/flock';
import Revenue from './components/revenue/revenue';
import Mortality from './components/mortality/Mortality';
import Vaccination from './components/vaccination/Vaccination';
import Expense from './components/expense/Expense';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/adminDashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgetPassword" element={<Resetpassword />} />
        <Route path="/egg-production" element={<EggProduction />} />
        <Route path="/egg-inventory" element={<EggInventory />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/flock" element={<Flock />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/mortality" element={<Mortality />} />
        <Route path="/vaccination" element={<Vaccination />} />
        <Route path="/expenses" element={<Expense />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;