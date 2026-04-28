const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom:      { type: String, required: true, trim: true },
  cat:      { type: String, required: true, enum: ['Légumes', 'Fruits', 'Épices', 'Confitures', 'Divers'] },
  prix:     { type: Number, required: true, min: 0 },
  stock:    { type: Number, default: 100, min: 0 },
  img:      { type: String, default: '' },
  actif:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Produit', produitSchema);
