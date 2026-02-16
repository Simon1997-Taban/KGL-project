const mongoose = require('mongoose');

const creditSaleSchema = new mongoose.Schema({
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    minlength: [2, 'Buyer name must be at least 2 characters']
  },
  nin: {
    type: String,
    required: [true, 'NIN (National ID) is required'],
    minlength: [6, 'NIN must be at least 6 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    minlength: [3, 'Location must be at least 3 characters']
  },
  contact: {
    type: String,
    required: [true, 'Contact is required'],
    match: [/^[0-9]{10,15}$/, 'Contact must be a valid phone number (10-15 digits)']
  },
  amountDue: {
    type: Number,
    required: [true, 'Amount due is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
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
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sales agent is required']
  },
  salesAgentName: {
    type: String,
    required: [true, 'Sales agent name is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  dispatchDate: {
    type: Date,
    default: Date.now
  },
  branch: {
    type: String,
    enum: ['branch1', 'branch2'],
    required: [true, 'Branch is required']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
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
creditSaleSchema.index({ branch: 1, status: 1, createdAt: -1 });
creditSaleSchema.index({ salesAgent: 1, createdAt: -1 });
creditSaleSchema.index({ dueDate: 1 });

module.exports = mongoose.model('CreditSale', creditSaleSchema);
