const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit'); // Charge votre modèle existant

// Gestion des images avec Multer & Cloudinary
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary (pensez à ajouter ces variables sur Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'terroir_senegal_produits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage: storage });

// ── 1. LIRE TOUS LES PRODUITS (GET /api/produits) ──
router.get('/', async (req, res) => {
  try {
    // On ne récupère que les produits actifs et on trie par nouveauté
    const produits = await Produit.find({ actif: true }).sort({ createdAt: -1 });
    res.json(produits);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── 2. AJOUTER UN PRODUIT AVEC IMAGE (POST /api/produits/ajouter) ──
// 'image' correspond au nom du champ envoyé par le formulaire HTML
router.post('/ajouter', upload.single('image'), async (req, res) => {
  try {
    const { nom, cat, prix, stock } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "L'image du produit est obligatoire." });
    }

    // Création du produit en respectant strictement votre schéma
    const nouveauProduit = new Produit({
      nom: nom,
      cat: cat, // Doit être 'Légumes', 'Fruits', 'Épices', 'Confitures' ou 'Divers'
      prix: Number(prix),
      stock: Number(stock),
      img: req.file.path // URL Cloudinary sécurisée stockée dans 'img'
    });

    await nouveauProduit.save();
    res.status(201).json({ success: true, message: "Produit ajouté avec succès !", produit: nouveauProduit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── 3. SUPPRIMER UN PRODUIT (DELETE /api/produits/supprimer/:id) ──
router.delete('/supprimer/:id', async (req, res) => {
  try {
    const produitSupprime = await Produit.findByIdAndDelete(req.params.id);
    
    if (!produitSupprime) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }
    
    res.json({ success: true, message: "Produit supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
