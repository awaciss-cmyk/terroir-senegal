const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const Commande = require('../models/Commande');
const Produit  = require('../models/Produit');

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ── Middleware auth admin ──
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: "Token manquant" });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
};

// GET /api/admin/stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const enAttente      = await Commande.countDocuments({ statut: 'en_attente' });
    const produitsActifs = await Produit.countDocuments({ actif: true });

    const caResult = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } }
    ]);

    res.json({
      success: true,
      stats: {
        chiffreAffaires: caResult[0]?.total || 0,
        totalCommandes,
        produitsActifs,
        enAttente
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/top-produits
router.get('/top-produits', verifyAdmin, async (req, res) => {
  try {
    const top = await Commande.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $unwind: '$articles' },
      {
        $group: {
          _id:       '$articles.produitId',
          nom:       { $first: '$articles.nom' },
          qteVendue: { $sum: '$articles.quantite' },
          revenus:   { $sum: '$articles.sousTotal' }
        }
      },
      { $sort: { qteVendue: -1 } },
      { $limit: 5 }
    ]);
    res.json({ success: true, topProduits: top });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/commandes
router.get('/commandes', verifyAdmin, async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, commandes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/commandes/:id/statut
router.patch('/commandes/:id/statut', verifyAdmin, async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByIdAndUpdate(
      req.params.id, { statut }, { new: true }
    );
    if (!commande)
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    res.json({ success: true, commande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
