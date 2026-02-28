const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  periodic: {
    type: Boolean,
    default: false
  },
  subcategoriaId: {
    type: String,
    default: null
  }
}, { _id: false });

module.exports = mongoose.model('ExpenseItem', expenseItemSchema);