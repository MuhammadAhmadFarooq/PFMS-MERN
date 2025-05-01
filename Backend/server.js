const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Import configurations
// const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const mortalityRoutes = require('./routes/mortalityRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const feedRoutes = require('./routes/feedRoutes');
const eggProductionRoutes = require('./routes/eggProductionRoutes');
const eggInventoryRoutes = require('./routes/eggInventoryRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');
const flockRoutes = require('./routes/flockRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

// Configure environment variables
dotenv.config();

// Initialize express
const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/mortality', mortalityRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/egg-production', eggProductionRoutes);
app.use('/api/egg-inventory', eggInventoryRoutes);
app.use('/api/user-dashboard', userDashboardRoutes);
app.use('/api/flock', flockRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 