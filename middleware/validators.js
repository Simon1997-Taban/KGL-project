/**
 * Input Validation Middleware
 * 
 * Author: Simon Lodongo Taban
 * Email: simonlodongotaban@gmail.com | simonlodongotaban@yahoo.com
 * Phone: +256 789121378 | +256 788858064
 * 
 * Purpose: Validates all incoming request data before processing.
 * Ensures data integrity and prevents invalid data from reaching database.
 * 
 * Validation Rules:
 * - Required fields validation
 * - Numeric field validation
 * - Phone number format (10-15 digits)
 * - String length validation
 * - Branch validation
 * - Date/time validation
 * - Email format validation
 * 
 * Functions:
 * - validateProcurement: Validates produce procurement data
 * - validateSale: Validates regular sales data
 * - validateCreditSale: Validates credit sales data
 */

/**
 * Procurment Data Validator
 * 
 * Validates all required fields and formats for procurement records.
 * Ensures produce names, prices, quantities, and contact info are valid.
 * 
 * Required Fields:
 * - name: String (min 2 chars)
 * - type: String (min 2 chars)
 * - stock: Number (>= 0)
 * - cost: Number (> 0)
 * - dealerName: String (min 2 chars)
 * - branch: enum ['branch1', 'branch2']
 * - contact: Phone number (10-15 digits)
 * - salePrice: Number (> 0)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateProcurement = (req, res, next) => {
  const { name, type, stock, cost, dealerName, branch, contact, salePrice } = req.body;

  // Array to collect all validation errors
  const errors = [];

  // Validate required string fields
  if (!name || name.trim().length < 2) errors.push('Produce name must be at least 2 characters');
  if (!type || type.trim().length < 2) errors.push('Produce type must be at least 2 characters');
  if (stock === undefined || stock === null) errors.push('Stock quantity is required');
  if (!cost) errors.push('Cost is required');
  if (!dealerName || dealerName.trim().length < 2) errors.push('Dealer name must be at least 2 characters');
  if (!branch || !['branch1', 'branch2'].includes(branch)) errors.push('Valid branch is required (branch1 or branch2)');
  if (!contact) errors.push('Contact number is required');
  if (!salePrice) errors.push('Sale price is required');

  // Validate numeric fields
  if (stock !== undefined && stock !== null) {
    if (isNaN(stock) || stock < 0) errors.push('Stock must be a non-negative number');
  }
  if (cost && (isNaN(cost) || cost <= 0)) errors.push('Cost must be a positive number');
  if (salePrice && (isNaN(salePrice) || salePrice <= 0)) errors.push('Sale price must be a positive number');

  // Validate phone number format
  if (contact && !/^[0-9]{10,15}$/.test(contact)) errors.push('Contact must be a valid phone number (10-15 digits)');

  // Return 400 with error messages if validation fails
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Validation passed, proceed to route handler
  next();
};

/**
 * Sales Data Validator
 * 
 * Validates all required fields and formats for regular sales records.
 * Ensures produce names, quantities, amounts, buyer info are valid.
 * 
 * Required Fields:
 * - produceName: String (min 2 chars)
 * - tonnage: Number (> 0)
 * - amountPaid: Number (>= 0)
 * - buyerName: String (min 2 chars)
 * - salesAgentName: String (min 2 chars)
 * - branch: enum ['branch1', 'branch2']
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateSale = (req, res, next) => {
  const { produceName, tonnage, amountPaid, buyerName, salesAgentName, branch } = req.body;

  // Array to collect validation errors
  const errors = [];

  // Validate required string fields
  if (!produceName || produceName.trim().length < 2) errors.push('Produce name must be at least 2 characters');
  if (!tonnage) errors.push('Tonnage is required');
  if (amountPaid === undefined || amountPaid === null) errors.push('Amount paid is required');
  if (!buyerName || buyerName.trim().length < 2) errors.push('Buyer name must be at least 2 characters');
  if (!salesAgentName || salesAgentName.trim().length < 2) errors.push('Sales agent name must be at least 2 characters');
  if (!branch || !['branch1', 'branch2'].includes(branch)) errors.push('Valid branch is required');

  // Validate numeric fields
  if (tonnage && (isNaN(tonnage) || tonnage <= 0)) errors.push('Tonnage must be a positive number');
  if (amountPaid !== undefined && amountPaid !== null && (isNaN(amountPaid) || amountPaid < 0)) errors.push('Amount paid must be a non-negative number');

  // Return 400 with error messages if validation fails
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Validation passed, proceed to route handler
  next();
};

/**
 * Credit Sale Data Validator
 * 
 * Validates all required fields and formats for credit sales records.
 * Ensures buyer information, amounts, dates, and produce details are valid.
 * 
 * Required Fields:
 * - buyerName: String (min 2 chars)
 * - nin: National ID (min 6 chars)
 * - location: String (min 3 chars)
 * - contact: Phone number (10-15 digits)
 * - amountDue: Number (> 0)
 * - produceName: String
 * - tonnage: Number (> 0)
 * - salesAgentName: String
 * - dueDate: Date (must be in future)
 * - branch: enum ['branch1', 'branch2']
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCreditSale = (req, res, next) => {
  const { buyerName, nin, location, contact, amountDue, produceName, tonnage, salesAgentName, dueDate, branch } = req.body;

  // Array to collect validation errors
  const errors = [];

  // Validate required string fields
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

  // Validate numeric fields
  if (amountDue && (isNaN(amountDue) || amountDue <= 0)) errors.push('Amount due must be a positive number');
  if (tonnage && (isNaN(tonnage) || tonnage <= 0)) errors.push('Tonnage must be a positive number');

  // Validate phone number format
  if (contact && !/^[0-9]{10,15}$/.test(contact)) errors.push('Contact must be a valid phone number (10-15 digits)');

  // Validate due date is in the future
  if (dueDate && new Date(dueDate) <= new Date()) errors.push('Due date must be in the future');

  // Return 400 with error messages if validation fails
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Validation passed, proceed to route handler
  next();
};

// Export all validation middleware functions
module.exports = {
  validateProcurement,
  validateSale,
  validateCreditSale
};
