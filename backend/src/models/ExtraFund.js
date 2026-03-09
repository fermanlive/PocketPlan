const { Schema } = require('mongoose');
const ExtraFundItemSchema = require('./ExtraFundItem');

const ExtraFundSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  source: {
    type: String,
    enum: ['cesantias', 'prima', 'venta', 'bono', 'otro'],
    default: 'otro',
  },
  date: { type: String },
  items: { type: [ExtraFundItemSchema], default: [] },
}, { _id: false });

module.exports = ExtraFundSchema;
