const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/manager-dashboard');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
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
  salePrice: Number
});

const Produce = mongoose.model('Produce', produceSchema);

// Define the schema for the sales
const salesSchema = new mongoose.Schema({
  produceName: String,
  tonnage: Number,
  amountPaid: Number,
  buyerName: String,
  salesAgentName: String
});

const Sale = mongoose.model('Sale', salesSchema);

// Define the schema for the reports
const reportSchema = new mongoose.Schema({
  reportType: String,
  branch: String
});

const Report = mongoose.model('Report', reportSchema);

// API endpoints
app.post('/procurement', (req, res) => {
  const produce = new Produce(req.body);
  produce.save((err, produce) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(produce);
    }
  });
});

app.get('/procurement', (req, res) => {
  Produce.find((err, produces) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(produces);
    }
  });
});

app.post('/sales', (req, res) => {
  const sale = new Sale(req.body);
  sale.save((err, sale) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(sale);
    }
  });
});

app.get('/sales', (req, res) => {
  Sale.find((err, sales) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(sales);
    }
  });
});

app.post('/reports', (req, res) => {
  const report = new Report(req.body);
  report.save((err, report) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(report);
    }
  });
});

app.get('/reports', (req, res) => {
  Report.find((err, reports) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(reports);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
