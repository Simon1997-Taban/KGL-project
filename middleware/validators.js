// Input validation middleware
const validateProcurement = (req, res, next) => {
  const { name, type, stock, cost, dealerName, branch, contact, salePrice } = req.body;

  const errors = [];

  // Required fields
  if (!name || name.trim().length < 2) errors.push('Produce name must be at least 2 characters');
  if (!type || type.trim().length < 2) errors.push('Produce type must be at least 2 characters');
  if (stock === undefined || stock === null) errors.push('Stock quantity is required');
  if (!cost) errors.push('Cost is required');
  if (!dealerName || dealerName.trim().length < 2) errors.push('Dealer name must be at least 2 characters');
  if (!branch || !['branch1', 'branch2'].includes(branch)) errors.push('Valid branch is required (branch1 or branch2)');
  if (!contact) errors.push('Contact number is required');
  if (!salePrice) errors.push('Sale price is required');

  // Numeric validations
  if (stock !== undefined && stock !== null) {
    if (isNaN(stock) || stock < 0) errors.push('Stock must be a non-negative number');
  }
  if (cost && (isNaN(cost) || cost <= 0)) errors.push('Cost must be a positive number');
  if (salePrice && (isNaN(salePrice) || salePrice <= 0)) errors.push('Sale price must be a positive number');

  // Phone number validation
  if (contact && !/^[0-9]{10,15}$/.test(contact)) errors.push('Contact must be a valid phone number (10-15 digits)');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateSale = (req, res, next) => {
  const { produceName, tonnage, amountPaid, buyerName, salesAgentName, branch } = req.body;

  const errors = [];

  if (!produceName || produceName.trim().length < 2) errors.push('Produce name must be at least 2 characters');
  if (!tonnage) errors.push('Tonnage is required');
  if (amountPaid === undefined || amountPaid === null) errors.push('Amount paid is required');
  if (!buyerName || buyerName.trim().length < 2) errors.push('Buyer name must be at least 2 characters');
  if (!salesAgentName || salesAgentName.trim().length < 2) errors.push('Sales agent name must be at least 2 characters');
  if (!branch || !['branch1', 'branch2'].includes(branch)) errors.push('Valid branch is required');

  // Numeric validations
  if (tonnage && (isNaN(tonnage) || tonnage <= 0)) errors.push('Tonnage must be a positive number');
  if (amountPaid !== undefined && amountPaid !== null && (isNaN(amountPaid) || amountPaid < 0)) errors.push('Amount paid must be a non-negative number');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateCreditSale = (req, res, next) => {
  const { buyerName, nin, location, contact, amountDue, produceName, tonnage, salesAgentName, dueDate, branch } = req.body;

  const errors = [];

  if (!buyerName || buyerName.trim().length < 2) errors.push('Buyer name must be at least 2 characters');
  if (!nin || nin.trim().length < 6) errors.push('NIN must be at least 6 characters');
  if (!location || location.trim().length < 3) errors.push('Location must be at least 3 characters');
  if (!contact) errors.push('Contact is required');
  if (!amountDue) errors.push('Amount due is required');
  if (!produceName) errors.push('Produce name is required');
  if (!tonnage) errors.push('Tonnage is required');
  if (!salesAgentName) errors.push('Sales agent name is required');
  if (!dueDate) errors.push('Due date is required');
  if (!branch || !['branch1', 'branch2'].includes(branch)) errors.push('Valid branch is required');

  // Numeric validations
  if (amountDue && (isNaN(amountDue) || amountDue <= 0)) errors.push('Amount due must be a positive number');
  if (tonnage && (isNaN(tonnage) || tonnage <= 0)) errors.push('Tonnage must be a positive number');

  // Phone validation
  if (contact && !/^[0-9]{10,15}$/.test(contact)) errors.push('Contact must be a valid phone number (10-15 digits)');

  // Date validation
  if (dueDate && new Date(dueDate) <= new Date()) errors.push('Due date must be in the future');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateProcurement,
  validateSale,
  validateCreditSale
};
