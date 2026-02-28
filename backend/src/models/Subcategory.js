const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: null },
  categoriaPadreId: { type: String, required: true }
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
