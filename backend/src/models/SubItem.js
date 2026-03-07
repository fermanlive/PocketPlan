const { Schema } = require('mongoose');

const SubItemSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: null },
  paid: { type: Boolean, default: false },
}, { _id: false });

module.exports = SubItemSchema;
