const { Schema } = require('mongoose');

const IncomeEntrySchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String },
}, { _id: false });

module.exports = IncomeEntrySchema;
