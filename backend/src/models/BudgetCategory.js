const mongoose = require('mongoose');
const ExpenseItem = require('./ExpenseItem');

const budgetCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  items: [ExpenseItem.schema],
  color: {
    type: String,
    required: true
  }
}, { _id: false });

module.exports = mongoose.model('BudgetCategory', budgetCategorySchema);