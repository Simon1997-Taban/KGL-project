/**
 * Reports & Analytics Routes
 * 
 * Author: Simon Lodongo Taban
 * Email: simonlodongotaban@gmail.com | simonlodongotaban@yahoo.com
 * Phone: +256 789121378 | +256 788858064
 * 
 * Purpose: Provides comprehensive reporting and analytics endpoints.
 * Directors can view company-wide reports and aggregated data.
 * Managers can view branch-specific reports and performance metrics.
 * Implements aggregation queries for sales summaries and performance tracking.
 * 
 * Endpoints:
 * - GET /api/reports/sales-summary - Company-wide sales aggregation (Directors)
 * - GET /api/reports/branch-report - Branch sales (Managers & Directors)
 * - GET /api/reports/inventory - Inventory status and valuation
 * - GET /api/reports/agent-performance - Agent performance metrics
 * 
 * Access Control:
 * - All endpoints require JWT token (verifyToken)
 * - sales-summary restricted to directors only
 * - Other endpoints available to managers and directors
 * 
 * Filtering Options:
 * - branch: Filter by branch1 or branch2
 * - startDate: Include only transactions from this date
 * - endDate: Include only transactions up to this date
 * - status: Filter credit sales by status (pending/paid/overdue)
 */

const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const CreditSale = require('../models/CreditSale');
const Produce = require('../models/Produce');
const { verifyToken, populateUser, onlyDirectors, authorizeRole } = require('../middleware/auth');

// Get aggregated sales report (Directors only)
router.get('/sales-summary', verifyToken, populateUser, onlyDirectors, async (req, res) => {
  try {
    const { branch, startDate, endDate } = req.query;

    const query = {};
    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get regular sales
    const sales = await Sale.find(query)
      .populate('produce', 'name type salePrice')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Get credit sales
    const creditSales = await CreditSale.find(query)
      .populate('produce', 'name type')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Calculate metrics
    const totalRegularSales = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
    const totalCreditSales = creditSales.reduce((sum, cs) => sum + cs.amountDue, 0);
    const paidCreditSales = creditSales.filter(cs => cs.status === 'paid').reduce((sum, cs) => sum + cs.amountDue, 0);
    const pendingCreditSales = creditSales.filter(cs => cs.status === 'pending').reduce((sum, cs) => sum + cs.amountDue, 0);

    // Sales by branch
    const salesByBranch = {};
    sales.forEach(sale => {
      if (!salesByBranch[sale.branch]) {
        salesByBranch[sale.branch] = { count: 0, total: 0 };
      }
      salesByBranch[sale.branch].count += 1;
      salesByBranch[sale.branch].total += sale.amountPaid;
    });

    // Sales by agent
    const salesByAgent = {};
    sales.forEach(sale => {
      const agentName = sale.salesAgentName;
      if (!salesByAgent[agentName]) {
        salesByAgent[agentName] = { count: 0, total: 0 };
      }
      salesByAgent[agentName].count += 1;
      salesByAgent[agentName].total += sale.amountPaid;
    });

    res.json({
      summary: {
        totalRegularSales,
        totalCreditSales,
        totalRevenue: totalRegularSales + paidCreditSales,
        pendingCreditSales,
        overdueCreditSales: creditSales.filter(cs => cs.status === 'overdue').reduce((sum, cs) => sum + cs.amountDue, 0)
      },
      salesByBranch,
      salesByAgent,
      totalTransactions: sales.length + creditSales.length,
      regularSalesCount: sales.length,
      creditSalesCount: creditSales.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get branch-wise sales report (Managers can see their branch, Directors see all)
router.get('/branch-report', verifyToken, populateUser, authorizeRole(['manager', 'director']), async (req, res) => {
  try {
    let branch = req.query.branch;

    // If manager, restrict to their branch
    if (req.user.role === 'manager' && !branch) {
      branch = req.userData.branch;
    } else if (req.user.role === 'manager' && branch !== req.userData.branch) {
      return res.status(403).json({ error: 'Managers can only view reports for their own branch' });
    }

    const query = {};
    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    // Regular sales
    const sales = await Sale.find(query)
      .populate('produce', 'name type salePrice stock')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Credit sales
    const creditSales = await CreditSale.find(query)
      .populate('produce', 'name type')
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Produce inventory
    const produce = await Produce.find(query).sort({ createdAt: -1 });

    // Calculate metrics
    const totalRegularSales = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
    const totalCreditSales = creditSales.reduce((sum, cs) => sum + cs.amountDue, 0);

    res.json({
      branch: branch || 'all',
      summary: {
        totalRegularSales,
        totalCreditSales,
        totalRevenue: totalRegularSales + creditSales.filter(cs => cs.status === 'paid').reduce((sum, cs) => sum + cs.amountDue, 0),
        pendingCredit: creditSales.filter(cs => cs.status === 'pending').reduce((sum, cs) => sum + cs.amountDue, 0),
        overdueCredit: creditSales.filter(cs => cs.status === 'overdue').reduce((sum, cs) => sum + cs.amountDue, 0)
      },
      inventory: {
        totalItems: produce.length,
        outOfStock: produce.filter(p => p.stock <= 0).length,
        lowStock: produce.filter(p => p.stock > 0 && p.stock < 10).length
      },
      transactions: {
        regularSalesCount: sales.length,
        creditSalesCount: creditSales.length,
        totalTransactions: sales.length + creditSales.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory report
router.get('/inventory', verifyToken, async (req, res) => {
  try {
    const { branch } = req.query;
    const query = {};

    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    }

    const produce = await Produce.find(query).sort({ name: 1 });

    const outOfStock = produce.filter(p => p.stock <= 0);
    const lowStock = produce.filter(p => p.stock > 0 && p.stock < 10);
    const adequateStock = produce.filter(p => p.stock >= 10);

    // Total value calculations
    const totalValue = produce.reduce((sum, p) => sum + (p.stock * p.cost), 0);
    const outOfStockValue = outOfStock.reduce((sum, p) => sum + (p.stock * p.cost), 0);

    res.json({
      summary: {
        totalItems: produce.length,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        adequateStock: adequateStock.length,
        totalValue,
        outOfStockValue
      },
      items: {
        outOfStock,
        lowStock,
        adequateStock
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance report (sales by agent over time)
router.get('/agent-performance', verifyToken, populateUser, authorizeRole(['manager', 'director']), async (req, res) => {
  try {
    const { branch, startDate, endDate } = req.query;

    const query = {};
    if (branch && ['branch1', 'branch2'].includes(branch)) {
      query.branch = branch;
    } else if (req.user.role === 'manager') {
      query.branch = req.userData.branch;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get sales by agent
    const sales = await Sale.find(query)
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Get credit sales by agent
    const creditSales = await CreditSale.find(query)
      .populate('salesAgent', 'name email')
      .sort({ createdAt: -1 });

    // Aggregate data
    const agentPerformance = {};

    sales.forEach(sale => {
      const agentId = sale.salesAgent._id.toString();
      if (!agentPerformance[agentId]) {
        agentPerformance[agentId] = {
          name: sale.salesAgent.name,
          email: sale.salesAgent.email,
          regularSalesCount: 0,
          regularSalesTotal: 0,
          creditSalesCount: 0,
          creditSalesTotal: 0
        };
      }
      agentPerformance[agentId].regularSalesCount += 1;
      agentPerformance[agentId].regularSalesTotal += sale.amountPaid;
    });

    creditSales.forEach(cs => {
      const agentId = cs.salesAgent._id.toString();
      if (!agentPerformance[agentId]) {
        agentPerformance[agentId] = {
          name: cs.salesAgent.name,
          email: cs.salesAgent.email,
          regularSalesCount: 0,
          regularSalesTotal: 0,
          creditSalesCount: 0,
          creditSalesTotal: 0
        };
      }
      agentPerformance[agentId].creditSalesCount += 1;
      agentPerformance[agentId].creditSalesTotal += cs.amountDue;
    });

    const performance = Object.values(agentPerformance).map(agent => ({
      ...agent,
      totalSales: agent.regularSalesTotal + agent.creditSalesTotal,
      totalTransactions: agent.regularSalesCount + agent.creditSalesCount
    }));

    res.json({
      count: performance.length,
      performance: performance.sort((a, b) => b.totalSales - a.totalSales)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
