const { Schema } = require('mongoose');
const SubItemSchema = require('./SubItem');

const ExtraFundItemSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  amount: { type: Number, default: 0 },
  icon: { type: String },
  note: { type: String },
  subitems: { type: [SubItemSchema], default: [] },
}, { _id: false });

module.exports = ExtraFundItemSchema;
