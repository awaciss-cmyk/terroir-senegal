const express  = require('express');
const Produit  = require('../models/Produit');
const { proteger, adminSeulement } = require('../middleware/auth');

const router = express.Router();

// GET /api/produits — Liste des produits (avec filtre optionnel par catégorie)
router.get('/', async (req, res) => {
  try {
    const filtre = { actif: true };
    if (req.query.cat && req.query.cat !== 'Tous') {
      filtre.cat = req.query.cat;
    }
    const produits = await Produit.find(filtre).sort({ createdAt: -1 });
    res.json({ success: true, data: produits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/produits/:id — Détail d'un produit
router.get('/:id', async (req, res) => {
  try {
    const p = await Produit.findById(req.params.id);
    if (!p || !p.actif) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/produits — Créer un produit (admin)
router.post('/', proteger, adminSeulement, async (req, res) => {
  try {
    const p = await Produit.create(req.body);
    res.status(201).json({ success: true, data: p });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/produits/:id — Modifier un produit (admin)
router.put('/:id', proteger, adminSeulement, async (req, res) => {
  try {
    const p = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: p });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/produits/:id — Désactiver un produit (admin, soft delete)
router.delete('/:id', proteger, adminSeulement, async (req, res) => {
  try {
    const p = await Produit.findByIdAndUpdate(req.params.id, { actif: false }, { new: true });
    if (!p) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, message: 'Produit désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
