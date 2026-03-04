const mongoose = require('mongoose');
const BudgetCategory = require('./BudgetCategory');
const WeeklyBudget = require('./WeeklyBudget');
const SavingsEntry = require('./SavingsEntry');
const DebtEntrySchema = require('./DebtEntry');

const monthDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
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
  savings: [SavingsEntry.schema],
  debts: { type: [DebtEntrySchema], default: [] },
  userId: {
    type: String,
    required: false,
    index: true,
    default: null,
  },
}, {
  timestamps: true
});

// Índice compuesto: cada usuario tiene su propio conjunto de meses
monthDataSchema.index({ id: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MonthData', monthDataSchema);