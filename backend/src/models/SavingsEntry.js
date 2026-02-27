const mongoose = require('mongoose');

const savingsEntrySchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  }
}, { _id: false });

module.exports = mongoose.model('SavingsEntry', savingsEntrySchema);