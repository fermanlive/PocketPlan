const { Schema } = require('mongoose');

const DebtEntrySchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  principal: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  installments: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  startDate: { type: String },
  timeline: { type: String, enum: ['corto', 'mediano', 'largo'], default: 'mediano' },
}, { _id: false });

module.exports = DebtEntrySchema;
