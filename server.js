require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');

const authRoutes      = require('./routes/auth');
const produitsRoutes  = require('./routes/produits');
const commandesRoutes = require('./routes/commandes');
const statsRoutes     = require('./routes/stats');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes API ───────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/produits',  produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/stats',     statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Terroir Sénégal API opérationnelle 🌿' });
});

// ── Servir le frontend ───────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  const Produit = require('./models/Produit');
  const Utilisateur = require('./models/Utilisateur');
  await Produit.deleteMany({});
  await Produit.insertMany([
    { nom: 'Aubergine', cat: 'Légumes', prix: 300, stock: 80 },
    { nom: 'Chou', cat: 'Légumes', prix: 500, stock: 60 },
    { nom: 'Papaye', cat: 'Fruits', prix: 600, stock: 40 },
    { nom: 'Mangue', cat: 'Fruits', prix: 100, stock: 200 },
    { nom: 'Oignon Rouge', cat: 'Légumes', prix: 400, stock: 120 },
    { nom: 'Piment Fort', cat: 'Épices', prix: 200, stock: 90 },
    { nom: 'Confiture Mangue', cat: 'Confitures', prix: 2500, stock: 30 },
    { nom: 'Citron', cat: 'Fruits', prix: 100, stock: 150 },
    { nom: 'Bissap séché', cat: 'Épices', prix: 800, stock: 70 },
    { nom: 'Poivron', cat: 'Légumes', prix: 350, stock: 55 },
    { nom: 'Banane Plantain', cat: 'Fruits', prix: 150, stock: 100 },
    { nom: 'Confiture Goyave', cat: 'Confitures', prix: 2200, stock: 25 },
  ]);
  await Utilisateur.deleteOne({ email: 'admin@terroir.sn' });
  await Utilisateur.create({ nom: 'Admin', email: 'admin@terroir.sn', password: 'admin1234', role: 'admin' });
  res.json({ success: true, message: 'Base de données initialisée !' });
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 404 & erreurs ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// ── Connexion MongoDB ────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message);
    process.exit(1);
  });
