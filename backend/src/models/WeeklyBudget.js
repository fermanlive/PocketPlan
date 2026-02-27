const mongoose = require('mongoose');

const weeklyBudgetSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: false });

module.exports = mongoose.model('WeeklyBudget', weeklyBudgetSchema);