const express = require('express');
const router = express.Router();

const Produit = require('../models/Produit');

// Middleware auth
const { proteger, adminSeulement } = require('../middleware/auth');

// Multer + Cloudinary
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'terroir_senegal_produits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage });

// ─────────────────────────────────────
// 1. LIRE TOUS LES PRODUITS
// GET /api/produits
// ─────────────────────────────────────

router.get('/', async (req, res) => {

  try {

    const produits = await Produit
      .find({ actif: true })
      .sort({ createdAt: -1 });

    res.json(produits);

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

// ─────────────────────────────────────
// 2. AJOUTER PRODUIT
// POST /api/produits/ajouter
// ─────────────────────────────────────

router.post(
  '/ajouter',
  proteger,
  adminSeulement,
  upload.single('image'),

  async (req, res) => {

    try {

      const { nom, cat, prix, stock } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image obligatoire"
        });
      }

      const nouveauProduit = new Produit({

        nom,
        cat,
        prix: Number(prix),
        stock: Number(stock),

        img: req.file.path,

        actif: true

      });

      await nouveauProduit.save();

      res.status(201).json({
        success: true,
        message: "Produit ajouté avec succès",
        produit: nouveauProduit
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

// ─────────────────────────────────────
// 3. SUPPRIMER PRODUIT
// DELETE /api/produits/supprimer/:id
// ─────────────────────────────────────

router.delete(
  '/supprimer/:id',
  proteger,
  adminSeulement,

  async (req, res) => {

    try {

      const produitSupprime =
        await Produit.findByIdAndDelete(req.params.id);

      if (!produitSupprime) {

        return res.status(404).json({
          success: false,
          message: "Produit introuvable"
        });

      }

      res.json({
        success: true,
        message: "Produit supprimé"
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

// ─────────────────────────────────────
// 4. STATISTIQUES ADMIN
// GET /api/produits/stats
// ─────────────────────────────────────

router.get(
  '/stats',
  proteger,
  adminSeulement,

  async (req, res) => {

    try {

      const totalProduits =
        await Produit.countDocuments();

      const produitsActifs =
        await Produit.countDocuments({
          actif: true
        });

      const stock = await Produit.aggregate([
        {
          $group: {
            _id: null,
            totalStock: {
              $sum: '$stock'
            }
          }
        }
      ]);

      res.json({

        success: true,

        totalProduits,

        produitsActifs,

        stockTotal:
          stock[0]?.totalStock || 0

      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

module.exports = router;
