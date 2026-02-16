const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  produce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produce',
    required: [true, 'Produce reference is required']
  },
  produceName: {
    type: String,
    required: [true, 'Produce name is required']
  },
  tonnage: {
    type: Number,
    required: [true, 'Tonnage is required'],
    min: [0.01, 'Tonnage must be greater than 0']
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount cannot be negative']
  },
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    minlength: [2, 'Buyer name must be at least 2 characters']
  },
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sales agent is required']
  },
  salesAgentName: {
    type: String,
    required: [true, 'Sales agent name is required']
  },
  branch: {
    type: String,
    enum: ['branch1', 'branch2'],
    required: [true, 'Branch is required']
  },
  saleType: {
    type: String,
    enum: ['regular', 'credit'],
    default: 'regular'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for common queries
saleSchema.index({ branch: 1, createdAt: -1 });
saleSchema.index({ salesAgent: 1, createdAt: -1 });
saleSchema.index({ produce: 1 });

module.exports = mongoose.model('Sale', saleSchema);
