/**
 * Sale Schema & Model
 * 
 * Author: Simon Lodongo Taban
 * Email: simonlodongotaban@gmail.com | simonlodongotaban@yahoo.com
 * Phone: +256 789121378 | +256 788858064
 * 
 * Description: Defines the Sale collection in MongoDB.
 * Records regular (non-credit) sales transactions.
 * When a sale is recorded, stock is automatically reduced in the Produce collection.
 * 
 * Key Features:
 * - Links to specific Produce items via ObjectId reference
 * - Tracks sales agent who recorded transaction
 * - Records both paid amount and quantity sold
 * - Branch-specific sales tracking
 * - Automatic timestamps for audit trail
 * - Database indexes for efficient queries
 */

const mongoose = require('mongoose');

/**
 * Sale Schema Definition
 * 
 * Represents a regular (immediate payment) sales transaction.
 * Stock is decremented automatically when sale is recorded.
 * 
 * Fields:
 * - produce: Reference to Produce item being sold (ObjectId)
 * - produceName: Denormalized product name (for quick access)
 * - tonnage: Quantity sold in tonnes
 * - amountPaid: Money received from buyer
 * - buyerName: Name of purchaser
 * - salesAgent: Reference to User who recorded sale
 * - salesAgentName: Denormalized agent name
 * - branch: Location where sale occurred
 * - saleType: Always 'regular' for this model (credit = separate collection)
 * - timestamps: Automatic audit trail
 */
const saleSchema = new mongoose.Schema({
  // Reference to the Produce item being sold
  // IMPORTANT: Stock in Produce is decremented when sale is created
  produce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produce',
    required: [true, 'Produce reference is required']
  },

  // Produce name - denormalized for quick display
  // Kept in case produce record is deleted (maintains sales history)
  produceName: {
    type: String,
    required: [true, 'Produce name is required']
  },

  // Quantity sold in tonnes
  // This amount is subtracted from Produce.stock
  tonnage: {
    type: Number,
    required: [true, 'Tonnage is required'],
    min: [0.01, 'Tonnage must be greater than 0']
  },

  // Amount of money received from buyer
  // Can be 0 if payment is pending but entered as regular sale
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount cannot be negative']
  },

  // Name of the buyer/customer
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    minlength: [2, 'Buyer name must be at least 2 characters']
  },

  // Reference to User who recorded this sale
  // Used to calculate individual agent performance
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sales agent is required']
  },

  // Agent name - denormalized for reports
  // Maintains sales history even if agent is deleted
  salesAgentName: {
    type: String,
    required: [true, 'Sales agent name is required']
  },

  // Branch where sale occurred
  // Used for branch-specific reporting
  branch: {
    type: String,
    enum: ['branch1', 'branch2'],
    required: [true, 'Branch is required']
  },

  // Type of sale - 'regular' for this model
  // Differentiates from credit sales which are in separate collection
  saleType: {
    type: String,
    enum: ['regular', 'credit'],
    default: 'regular'
  },

  // Automatic timestamp of when sale was recorded
  // Used for chronological reporting
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create database indexes for fast query performance
// Index for querying sales by branch sorted by date
saleSchema.index({ branch: 1, createdAt: -1 });

// Index for agent performance queries - get all sales by an agent
saleSchema.index({ salesAgent: 1, createdAt: -1 });

// Index for produce history - see all sales of specific produce
saleSchema.index({ produce: 1 });

// Export compiled Sale model for use in routes
module.exports = mongoose.model('Sale', saleSchema);
