const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Attempt to load multer for handling file uploads. If it's not installed,
// fall back to not saving files and continue handling JSON registrations.
let multer;
let uploadMiddleware = null;
try {
  multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
      cb(null, uniqueSuffix + '-' + sanitized);
    }
  });
  const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
  uploadMiddleware = upload.single('photo');
} catch (e) {
  console.warn('Optional dependency "multer" not found; file upload disabled. Install with: npm install multer');
}
// Register endpoint
if (uploadMiddleware) {
  router.post('/register', uploadMiddleware, async (req, res) => {
    try {
      console.log('Register request received (with possible file):', { email: req.body.email, role: req.body.role });

      const { name, email, password, confirmPassword, role } = req.body;

      // Validate required fields
      if (!name || !email || !password || !confirmPassword || !role) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('User already exists:', email);
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Build user object
      const userData = {
        name,
        email,
        password: hashedPassword,
        role
      };

      if (req.file) {
        // Save public-accessible path
        userData.photo = '/uploads/' + req.file.filename;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log('User registered successfully:', email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        role: user.role,
        userId: user._id,
        name: user.name,
        photo: user.photo
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  });
} else {
  router.post('/register', async (req, res) => {
    try {
      console.log('Register request received:', { email: req.body.email, role: req.body.role });
      
      const { name, email, password, confirmPassword, role } = req.body;

      // Validate required fields
      if (!name || !email || !password || !confirmPassword || !role) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('User already exists:', email);
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user (no photo)
      const user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role 
      });
      
      await user.save();
      console.log('User registered successfully:', email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ 
        message: 'User registered successfully',
        token,
        role: user.role,
        userId: user._id,
        name: user.name
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      role: user.role,
      userId: user._id,
      name: user.name,
      photo: user.photo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;