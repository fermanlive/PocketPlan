const mongoose = require('mongoose');

const userDebtSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  principal: { type: Number, default: 0 },
  monthlyPayment: { type: Number, default: 0 },
  installments: { type: Number, default: 1 },
  interestRate: { type: Number, default: 0 },
  startDate: { type: String, default: '' },
  timeline: { type: String, enum: ['corto', 'mediano', 'largo'], default: 'mediano' },
  userId: { type: String, default: null, index: true },
}, { timestamps: true });

userDebtSchema.index({ id: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('UserDebt', userDebtSchema);
