const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
{
  nom: {
    type: String,
    required: true,
    trim: true
  },

  cat: {
    type: String,
    required: true,
    enum: ['Légumes', 'Fruits', 'Épices', 'Confitures', 'Divers']
  },

  prix: {
    type: Number,
    required: true,
    min: 0
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  img: {
    type: String,
    required: true
  },

  actif: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
}
);

// IMPORTANT : exporter le modèle Mongoose
module.exports = mongoose.model('Produit', produitSchema);
