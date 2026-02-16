const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Produce = require('../models/Produce');
const { verifyToken, populateUser, onlyManagersAndAgents } = require('../middleware/auth');
const { validateSale } = require('../middleware/validators');

// Record a sale (Manager and Agent only)
router.post('/', verifyToken, populateUser, onlyManagersAndAgents, validateSale, async (req, res) => {
  try {
    const { produceName, tonnage, amountPaid, buyerName, branch } = req.body;

    // Find the produce item
    const produce = await Produce.findOne({ name: produceName, branch });

    if (!produce) {
      return res.status(404).json({ error: `Produce "${produceName}" not found in your branch` });
    }

    // Check if stock is available
    if (produce.stock < tonnage) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${produce.stock} tonnes, Requested: ${tonnage} tonnes` 
      });
    }

    // Create sale record
    const sale = new Sale({
      produce: produce._id,
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      salesAgent: req.user.userId,
      salesAgentName: req.userData.name,
      branch,
      saleType: 'regular'
    });

    // Reduce stock
    produce.stock -= tonnage;
    produce.updatedAt = new Date();

    // Save both records
    await sale.save();
    await produce.save();

    res.status(201).json({
      message: 'Sale recorded successfully',
      sale,
      remainingStock: produce.stock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sales (with optional filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { branch, saleType } = req.query;
    const query = {};

    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    if (saleType && ['regular', 'credit'].includes(saleType)) {
      query.saleType = saleType;
    }

    const sales = await Sale.find(query)
      .populate('produce', 'name type salePrice stock')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Calculate total sales
    const totalSales = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);

    res.json({
      count: sales.length,
      totalSales,
      sales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by sales agent
router.get('/agent/:agentId', verifyToken, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { branch } = req.query;

    const query = { salesAgent: agentId };

    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    const sales = await Sale.find(query)
      .populate('produce', 'name type salePrice')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    const totalSales = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);

    res.json({
      count: sales.length,
      totalSales,
      sales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('produce')
      .populate('salesAgent', 'name email');

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
