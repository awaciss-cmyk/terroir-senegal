const mongoose = require('mongoose');

const ProduitSchema = new mongoose.Schema(
  {
    nom:   { type: String, required: true },
    cat:   { type: String, required: true },
    prix:  { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    img:   { type: String, default: '' },
    actif: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Produit', ProduitSchema);
