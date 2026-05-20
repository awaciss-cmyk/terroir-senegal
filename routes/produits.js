const express  = require('express');
const Produit  = require('../models/Produit');
const { proteger, adminSeulement } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// GET /api/produits
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

// GET /api/produits/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Produit.findById(req.params.id);
    if (!p || !p.actif) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/produits — avec upload image
router.post('/', proteger, adminSeulement, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.img = req.file.path;
    }
    const p = await Produit.create(data);
    res.status(201).json({ success: true, data: p });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/produits/:id — avec upload image
router.put('/:id', proteger, adminSeulement, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.img = req.file.path;
    }
    const p = await Produit.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: p });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/produits/:id
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
