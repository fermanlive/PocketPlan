const mongoose = require('mongoose');
const ExtraFundItemSchema = require('./ExtraFundItem');

const userExtraFundSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  source: {
    type: String,
    enum: ['cesantias', 'prima', 'venta', 'bono', 'otro'],
    default: 'otro',
  },
  date: { type: String, default: '' },
  items: { type: [ExtraFundItemSchema], default: [] },
  userId: { type: String, default: null, index: true },
}, { timestamps: true });

userExtraFundSchema.index({ id: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('UserExtraFund', userExtraFundSchema);
