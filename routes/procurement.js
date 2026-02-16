const express = require('express');
const router = express.Router();
const Produce = require('../models/Produce');
const { verifyToken, populateUser, onlyManagers } = require('../middleware/auth');
const { validateProcurement } = require('../middleware/validators');

// Record new procurement (Only Managers)
router.post('/', verifyToken, populateUser, onlyManagers, validateProcurement, async (req, res) => {
  try {
    const { name, type, stock, cost, dealerName, branch, contact, salePrice } = req.body;

    // Verify manager's branch matches procurement branch
    if (req.userData.branch !== branch) {
      return res.status(403).json({ error: 'You can only record procurement for your assigned branch' });
    }

    const produce = new Produce({
      name,
      type,
      stock,
      cost,
      dealerName,
      branch,
      contact,
      salePrice,
      recordedBy: req.user.userId
    });

    await produce.save();
    res.status(201).json({
      message: 'Procurement recorded successfully',
      produce
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all produce (with optional branch filter)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { branch } = req.query;
    const query = {};

    // Filter by branch if specified
    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    const produces = await Produce.find(query)
      .populate('recordedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: produces.length,
      produces
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get produce by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id).populate('recordedBy', 'name email');
    
    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update produce (Only Managers)
router.put('/:id', verifyToken, populateUser, onlyManagers, async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id);

    if (!produce) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    // Verify manager's branch matches produce branch
    if (req.userData.branch !== produce.branch) {
      return res.status(403).json({ error: 'You can only update produce from your assigned branch' });
    }

    const { name, type, stock, cost, dealerName, contact, salePrice } = req.body;

    if (name) produce.name = name;
    if (type) produce.type = type;
    if (stock !== undefined) produce.stock = stock;
    if (cost) produce.cost = cost;
    if (dealerName) produce.dealerName = dealerName;
    if (contact) produce.contact = contact;
    if (salePrice) produce.salePrice = salePrice;
    produce.updatedAt = new Date();

    await produce.save();
    res.json({
      message: 'Produce updated successfully',
      produce
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get out-of-stock items
router.get('/alerts/out-of-stock', verifyToken, async (req, res) => {
  try {
    const { branch } = req.query;
    const query = { stock: { $lte: 0 } };

    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    const outOfStock = await Produce.find(query).sort({ createdAt: -1 });

    res.json({
      count: outOfStock.length,
      message: outOfStock.length > 0 ? `${outOfStock.length} items out of stock` : 'All items in stock',
      items: outOfStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
