const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if user has required role(s)
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Only managers can record procurement
const onlyManagers = authorizeRole(['manager', 'director']);

// Only managers and agents can record sales
const onlyManagersAndAgents = authorizeRole(['manager', 'agent', 'director']);

// Only directors can view reports
const onlyDirectors = authorizeRole(['director']);

// Middleware to fetch user details from token
const populateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userData = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  verifyToken,
  authorizeRole,
  onlyManagers,
  onlyManagersAndAgents,
  onlyDirectors,
  populateUser
};
