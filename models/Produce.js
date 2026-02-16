const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Produce name is required'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  type: {
    type: String,
    required: [true, 'Produce type is required'],
    minlength: [2, 'Type must be at least 2 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0.01, 'Cost must be greater than 0']
  },
  dealerName: {
    type: String,
    required: [true, 'Dealer name is required'],
    minlength: [2, 'Dealer name must be at least 2 characters']
  },
  branch: {
    type: String,
    enum: ['branch1', 'branch2'],
    required: [true, 'Branch is required']
  },
  contact: {
    type: String,
    required: [true, 'Dealer contact is required'],
    match: [/^[0-9]{10,15}$/, 'Contact must be a valid phone number (10-15 digits)']
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0.01, 'Sale price must be greater than 0']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for common queries
produceSchema.index({ branch: 1, createdAt: -1 });
produceSchema.index({ name: 1, branch: 1 });

module.exports = mongoose.model('Produce', produceSchema);
