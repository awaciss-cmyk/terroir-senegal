const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Commande = require('../models/Commande');
const Produit  = require('../models/Produit');

const JWT_SECRET   = process.env.JWT_SECRET || "secret123";
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

// ── Middleware auth admin ──
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: "Token manquant" });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token invalide" });
  }
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD)
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

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
          _id:      '$articles.produitId',
          nom:      { $first: '$articles.nom' },
          qteVendue: { $sum: '$articles.quantite' },
