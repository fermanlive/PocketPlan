const mongoose = require('mongoose');

const userSavingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, default: 0 },
  date: { type: String, default: '' },
  userId: { type: String, default: null, index: true },
}, { timestamps: true });

userSavingSchema.index({ id: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('UserSaving', userSavingSchema);
