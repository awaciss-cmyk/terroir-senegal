const express  = require('express');
const Commande = require('../models/Commande');
const Produit  = require('../models/Produit');
const { proteger, adminSeulement } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats — Tableau de bord admin
router.get('/', async (req, res) => {
  // Route publique pour la démo (en production, ajouter proteger + adminSeulement)
  try {
    const [
      totalCommandes,
      enAttente,
      confirmees,
      revenusAgg,
      parMethode,
      topProduits,
      totalProduits,
    ] = await Promise.all([
      Commande.countDocuments(),
      Commande.countDocuments({ statut: 'en_attente' }),
      Commande.countDocuments({ statut: 'confirmee' }),

      // Revenu total (commandes confirmées + livrées)
      Commande.aggregate([
        { $match: { statut: { $in: ['confirmee', 'livree'] } } },
        { $group: { _id: null, total: { $sum: '$montantTotal' } } },
      ]),

      // Répartition par méthode de paiement
      Commande.aggregate([
        { $group: {
          _id: '$paiement.methode',
          count: { $sum: 1 },
          montant: { $sum: '$montantTotal' },
        }},
        { $sort: { count: -1 } },
      ]),

      // Top 5 produits vendus
      Commande.aggregate([
        { $unwind: '$articles' },
        { $group: {
          _id: '$articles.nom',
          qte: { $sum: '$articles.quantite' },
          revenu: { $sum: '$articles.sousTotal' },
        }},
        { $sort: { qte: -1 } },
        { $limit: 5 },
      ]),

      Produit.countDocuments({ actif: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalCommandes,
        enAttente,
        confirmees,
        revenuTotal: revenusAgg[0]?.total || 0,
        parMethode,
        topProduits,
        totalProduits,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
