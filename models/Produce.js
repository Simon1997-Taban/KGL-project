/**
 * Produce/Inventory Schema & Model
 * 
 * Author: Simon Lodongo Taban
 * Email: simonlodongotaban@gmail.com | simonlodongotaban@yahoo.com
 * Phone: +256 789121378 | +256 788858064
 * 
 * Description: Defines the Produce collection in MongoDB.
 * Tracks all inventory items with their stock levels, pricing, and dealer info.
 * Central to stock management - stock is automatically reduced when items are sold.
 * 
 * Key Features:
 * - Stock tracking with automatic reduction on sales
 * - Price management (cost vs sale price)
 * - Dealer/supplier information
 * - Branch-specific inventory
 * - Database indexes for fast queries
 */

const mongoose = require('mongoose');

/**
 * Produce Schema Definition
 * 
 * Represents a produce item in inventory with all relevant commercial info.
 * Stock field is decremented when sales or credit sales are recorded.
 * 
 * Fields:
 * - name: Product name (e.g., "Maize", "Beans")
 * - type: Product type/variety (e.g., "Yellow Corn", "Runner Beans")
 * - stock: Current available tonnage (decremented on sales)
 * - cost: Purchase cost per unit
 * - dealerName: Supplier/dealer company name
 * - branch: Which branch holds this inventory
 * - contact: Dealer contact information
 * - salePrice: Selling price per unit (pre-set by managers)
 * - recordedBy: Reference to User who recorded procurement
 * - timestamps: Automatic creation and update times
 */
const produceSchema = new mongoose.Schema({
  // Product name - e.g., "Maize", "Beans", "Rice"
  name: {
    type: String,
    required: [true, 'Produce name is required'],
    minlength: [2, 'Name must be at least 2 characters']
  },

  // Product type/variety - e.g., "Yellow Corn", "Runner Beans"
  type: {
    type: String,
    required: [true, 'Produce type is required'],
    minlength: [2, 'Type must be at least 2 characters']
  },

  // Current available stock in tonnes
  // IMPORTANT: This field is automatically decremented when sales are recorded
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },

  // Cost price per unit - used for inventory valuation
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0.01, 'Cost must be greater than 0']
  },

  // Supplier/dealer company name
  dealerName: {
    type: String,
    required: [true, 'Dealer name is required'],
    minlength: [2, 'Dealer name must be at least 2 characters']
  },

  // Branch location for this inventory item
  // Determines which location has this produce
  branch: {
    type: String,
    enum: ['branch1', 'branch2'],
    required: [true, 'Branch is required']
  },

  // Dealer/supplier contact information
  contact: {
    type: String,
    required: [true, 'Dealer contact is required'],
    match: [/^[0-9]{10,15}$/, 'Contact must be a valid phone number (10-15 digits)']
  },

  // Sale price per unit - pre-set by managers
  // Used to calculate sale amounts
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0.01, 'Sale price must be greater than 0']
  },

  // Reference to User who recorded this procurement
  // Allows tracking which manager added this item
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },

  // Automatic timestamp of when record was created
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Automatic timestamp of last update - useful for auditing
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create database indexes for fast query performance
// Index for common queries filtering by branch and sorting by date
produceSchema.index({ branch: 1, createdAt: -1 });

// Index for searching produce by name within a branch
produceSchema.index({ name: 1, branch: 1 });

// Export compiled Produce model for use in routes
module.exports = mongoose.model('Produce', produceSchema);
