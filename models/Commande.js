const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  produitId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
  nom:        { type: String, required: true },
  prix:       { type: Number, required: true },
  quantite:   { type: Number, required: true, min: 1 },
  sousTotal:  { type: Number, required: true },
});

const commandeSchema = new mongoose.Schema({
  numeroCommande: { type: String, unique: true },

  articles:  [articleSchema],

  paiement: {
    methode: { type: String, enum: ['wave', 'card'], required: true },
    detail:  { type: String },           // N° téléphone Wave ou 4 derniers chiffres carte
  },

  client: {
    nom:       { type: String },
    telephone: { type: String },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  },

  montantArticles: { type: Number, required: true },
  fraisLivraison:  { type: Number, default: 500 },
  montantTotal:    { type: Number, required: true },

  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee'],
    default: 'en_attente',
  },
}, { timestamps: true });

// Générer un numéro de commande unique avant sauvegarde
commandeSchema.pre('save', function (next) {
  if (!this.numeroCommande) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.numeroCommande = `TS-${ts}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Commande', commandeSchema);
