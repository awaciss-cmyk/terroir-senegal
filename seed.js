/**
 * seed.js — Initialise la base de données avec les produits
 * et crée un compte administrateur par défaut.
 *
 * Usage : node seed.js
 */

require('dotenv').config();
const mongoose     = require('mongoose');
const Produit      = require('./models/Produit');
const Utilisateur  = require('./models/Utilisateur');

const PRODUITS = [
  {
    nom: 'Aubergine',
    cat: 'Légumes',
    prix: 300,
    stock: 80,
    img: 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400&q=80'
  },
  {
    nom: 'Chou',
    cat: 'Légumes',
    prix: 500,
    stock: 60,
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80'
  },
  {
    nom: 'Papaye',
    cat: 'Fruits',
    prix: 600,
    stock: 40,
    img: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80'
  },
  {
    nom: 'Mangue',
    cat: 'Fruits',
    prix: 100,
    stock: 200,
    img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80'
  },
  {
    nom: 'Oignon Rouge',
    cat: 'Légumes',
    prix: 400,
    stock: 120,
    img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80'
  },
  {
    nom: 'Piment Fort',
    cat: 'Épices',
    prix: 200,
    stock: 90,
    img: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&q=80'
  },
  {
    nom: 'Confiture Mangue',
    cat: 'Confitures',
    prix: 2500,
    stock: 30,
    img: 'https://images.unsplash.com/photo-1597528380253-e8b7d384d2e2?w=400&q=80'
  },
  {
    nom: 'Citron',
    cat: 'Fruits',
    prix: 100,
    stock: 150,
    img: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80'
  },
  {
    nom: 'Bissap séché',
    cat: 'Épices',
    prix: 800,
    stock: 70,
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80'
  },
  {
    nom: 'Poivron',
    cat: 'Légumes',
    prix: 350,
    stock: 55,
    img: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&q=80'
  },
  {
    nom: 'Banane Plantain',
    cat: 'Fruits',
    prix: 150,
    stock: 100,
    img: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&q=80'
  },
  {
    nom: 'Confiture Goyave',
    cat: 'Confitures',
    prix: 2200,
    stock: 25,
    img: 'https://images.unsplash.com/photo-1562529536-5b00c4c50d88?w=400&q=80'
  },
];

const ADMIN = {
  nom:      'Administrateur',
  email:    'admin@terroir.sn',
  password: 'admin1234',
  role:     'admin',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Produits
    await Produit.deleteMany({});
    const produits = await Produit.insertMany(PRODUITS);
    console.log(`✅ ${produits.length} produits insérés`);

    // Admin
    await Utilisateur.deleteOne({ email: ADMIN.email });
    const admin = await Utilisateur.create(ADMIN);
    console.log(`✅ Compte admin créé : ${admin.email} / mot de passe : admin1234`);

    console.log('\n🌿 Base de données initialisée avec succès !');
    console.log('⚠️  Changez le mot de passe admin avant la mise en production.\n');
  } catch (err) {
    console.error('❌ Erreur seed :', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
