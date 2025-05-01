const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// Configure environment variables
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = '24h';  // Token expiration time
const REFRESH_TOKEN_EXPIRE = '7d';  // Refresh token expiration

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRE
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Password reset token configuration
const RESET_TOKEN_EXPIRE = 3600000; // 1 hour in milliseconds

// Cookie options for JWT
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Authentication configuration object
const authConfig = {
    JWT_SECRET,
    JWT_EXPIRE,
    REFRESH_TOKEN_EXPIRE,
    RESET_TOKEN_EXPIRE,
    cookieOptions
};

module.exports = {
    authConfig,
    generateToken,
    generateRefreshToken,
    verifyToken
}; 