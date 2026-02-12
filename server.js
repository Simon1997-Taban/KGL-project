const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware - order matters!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add debug logging for requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kgl';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Auth Routes - MUST come after middleware
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Landing page - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Public pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'register.html'));
});

// Role-based dashboard routes
app.get('/manager-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'manager.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'admin.html'));
});

app.get('/procurement-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'procurement.html'));
});

app.get('/agent-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'agent.html'));
});

// Define the schema for the produce
const produceSchema = new mongoose.Schema({
  name: String,
  type: String,
  tonnage: Number,
  cost: Number,
  dealerName: String,
  branch: String,
  contact: String,
  salePrice: Number,
  createdAt: { type: Date, default: Date.now }
});

const Produce = mongoose.model('Produce', produceSchema);

// Define the schema for the sales
const salesSchema = new mongoose.Schema({
  produceName: String,
  tonnage: Number,
  amountPaid: Number,
  buyerName: String,
  salesAgentName: String,
  createdAt: { type: Date, default: Date.now }
});

const Sale = mongoose.model('Sale', salesSchema);

// Define the schema for the reports
const reportSchema = new mongoose.Schema({
  reportType: String,
  branch: String,
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// API endpoints for Procurement
app.post('/api/procurement', (req, res) => {
  const produce = new Produce(req.body);
  produce.save((err, produce) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json(produce);
    }
  });
});

app.get('/api/procurement', (req, res) => {
  Produce.find().sort({ createdAt: -1 }).exec((err, produces) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json(produces);
    }
  });
});

// API endpoints for Sales
app.post('/api/sales', (req, res) => {
  const sale = new Sale(req.body);
  sale.save((err, sale) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json(sale);
    }
  });
});

app.get('/api/sales', (req, res) => {
  Sale.find().sort({ createdAt: -1 }).exec((err, sales) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json(sales);
    }
  });
});

// API endpoints for Reports
app.post('/api/reports', (req, res) => {
  const report = new Report(req.body);
  report.save((err, report) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json(report);
    }
  });
});

app.get('/api/reports', (req, res) => {
  Report.find().sort({ createdAt: -1 }).exec((err, reports) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json(reports);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  GET  /          - Redirect to login');
  console.log('  GET  /login     - Login page');
  console.log('  GET  /register  - Register page');
  console.log('  POST /api/auth/login    - Login endpoint');
  console.log('  POST /api/auth/register - Register endpoint');
  console.log('  GET  /manager-dashboard       - Manager dashboard');
  console.log('  GET  /admin-dashboard         - Admin dashboard');
  console.log('  GET  /procurement-dashboard   - Procurement dashboard');
  console.log('  GET  /agent-dashboard         - Sales Agent dashboard');
});
