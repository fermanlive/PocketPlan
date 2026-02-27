const mongoose = require('mongoose');
const BudgetCategory = require('./BudgetCategory');
const WeeklyBudget = require('./WeeklyBudget');
const SavingsEntry = require('./SavingsEntry');

const monthDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}-\d{2}$/
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  salary: {
    type: Number,
    required: true
  },
  categories: [BudgetCategory.schema],
  weeklyBudgets: [WeeklyBudget.schema],
  savings: [SavingsEntry.schema]
}, {
  timestamps: true
});

module.exports = mongoose.model('MonthData', monthDataSchema);