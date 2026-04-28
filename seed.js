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
  { nom: 'Aubergine',         cat: 'Légumes',     prix: 300,  stock: 80,  img: '' },
  { nom: 'Chou',              cat: 'Légumes',     prix: 500,  stock: 60,  img: '' },
  { nom: 'Papaye',            cat: 'Fruits',      prix: 600,  stock: 40,  img: '' },
  { nom: 'Mangue',            cat: 'Fruits',      prix: 100,  stock: 200, img: '' },
  { nom: 'Oignon Rouge',      cat: 'Légumes',     prix: 400,  stock: 120, img: '' },
  { nom: 'Piment Fort',       cat: 'Épices',      prix: 200,  stock: 90,  img: '' },
  { nom: 'Confiture Mangue',  cat: 'Confitures',  prix: 2500, stock: 30,  img: '' },
  { nom: 'Citron',            cat: 'Fruits',      prix: 100,  stock: 150, img: '' },
  { nom: 'Bissap séché',      cat: 'Épices',      prix: 800,  stock: 70,  img: '' },
  { nom: 'Poivron',           cat: 'Légumes',     prix: 350,  stock: 55,  img: '' },
  { nom: 'Banane Plantain',   cat: 'Fruits',      prix: 150,  stock: 100, img: '' },
  { nom: 'Confiture Goyave',  cat: 'Confitures',  prix: 2200, stock: 25,  img: '' },
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
