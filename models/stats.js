const express = require('express');
const router = express.Router();
const { proteger, adminSeulement } = require('../middleware/auth');
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const Utilisateur = require('../models/Utilisateur');

router.get('/', proteger, adminSeulement, async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const totalProduits = await Produit.countDocuments({ actif: true });
    const totalUtilisateurs = await Utilisateur.countDocuments();

    // Chiffre d'affaires total
    const ca = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } }
    ]);
    const chiffreAffaires = ca[0]?.total || 0;

    // Produit le plus vendu
    const topProduit = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $unwind: '$articles' },
      { $group: { _id: '$articles.nom', totalVendu: { $sum: '$articles.quantite' } } },
      { $sort: { totalVendu: -1 } },
      { $limit: 1 }
    ]);

    res.json({
      success: true,
      data: {
        chiffreAffaires,
        totalCommandes,
        totalProduits,
        totalUtilisateurs,
        topProduit: topProduit[0] || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
