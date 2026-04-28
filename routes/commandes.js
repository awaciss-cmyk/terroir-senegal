const express  = require('express');
const Commande = require('../models/Commande');
const Produit  = require('../models/Produit');
const { proteger, adminSeulement } = require('../middleware/auth');

const router = express.Router();

// POST /api/commandes — Passer une commande
router.post('/', async (req, res) => {
  try {
    const { articles, paiement, client } = req.body;

    if (!articles || articles.length === 0) {
      return res.status(400).json({ success: false, message: 'Panier vide' });
    }
    if (!paiement || !paiement.methode) {
      return res.status(400).json({ success: false, message: 'Méthode de paiement requise' });
    }

    // Vérifier et décrémenter le stock pour chaque article
    const articlesVerifies = [];
    for (const art of articles) {
      const produit = await Produit.findById(art.produitId).catch(() => null)
        || await Produit.findOne({ _id: { $exists: true }, nom: art.nom }); // fallback par nom

      if (produit) {
        if (produit.stock < art.quantite) {
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant pour "${produit.nom}" (disponible : ${produit.stock})`
          });
        }
        // Décrémente le stock
        await Produit.findByIdAndUpdate(produit._id, { $inc: { stock: -art.quantite } });
        articlesVerifies.push({
          produitId: produit._id,
          nom:       produit.nom,
          prix:      produit.prix,
          quantite:  art.quantite,
          sousTotal: produit.prix * art.quantite,
        });
      } else {
        // Article non trouvé en BDD (mode fallback frontend)
        articlesVerifies.push({
          nom:      art.nom,
          prix:     art.prix,
          quantite: art.quantite,
          sousTotal: art.sousTotal,
        });
      }
    }

    const montantArticles = articlesVerifies.reduce((s, a) => s + a.sousTotal, 0);
    const fraisLivraison  = 500;
    const montantTotal    = montantArticles + fraisLivraison;

    const commande = await Commande.create({
      articles:       articlesVerifies,
      paiement,
      client:         { ...client, userId: req.user?._id },
      montantArticles,
      fraisLivraison,
      montantTotal,
    });

    res.status(201).json({
      success: true,
      message: 'Commande enregistrée avec succès',
      data: {
        numeroCommande: commande.numeroCommande,
        montantTotal:   commande.montantTotal,
        statut:         commande.statut,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/commandes — Toutes les commandes (admin uniquement)
router.get('/', proteger, adminSeulement, async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const filtre = statut ? { statut } : {};

    const commandes = await Commande.find(filtre)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Commande.countDocuments(filtre);

    res.json({ success: true, data: commandes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/commandes/:id — Détail d'une commande (admin)
router.get('/:id', proteger, adminSeulement, async (req, res) => {
  try {
    const c = await Commande.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/commandes/:id/statut — Mettre à jour le statut (admin)
router.patch('/:id/statut', proteger, adminSeulement, async (req, res) => {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const c = await Commande.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!c) return res.status(404).json({ success: false, message: 'Commande introuvable' });

    res.json({ success: true, message: 'Statut mis à jour', data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
