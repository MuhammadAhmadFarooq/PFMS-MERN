const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/auth');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                message: 'Not authorized to access this route' 
            });
        }

        const decoded = verifyToken(token);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.status(401).json({ 
            message: 'Not authorized to access this route' 
        });
    }
};

exports.adminOnly = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(req.user.role);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
