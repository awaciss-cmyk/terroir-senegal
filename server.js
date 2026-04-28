require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');

// ── Routes ─────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const produitsRoutes  = require('./routes/produits');
const commandesRoutes = require('./routes/commandes');
const statsRoutes     = require('./routes/stats');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ───────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Fichiers statiques (HTML + images) ────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/stats', statsRoutes);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Terroir Sénégal API opérationnelle 🌿'
  });
});

// ── SEED (initialisation base de données) ─────────────
app.get('/api/seed', async (req, res) => {
  try {
    const Produit = require('./models/Produit');
    const Utilisateur = require('./models/Utilisateur');

    await Produit.deleteMany({});

    await Produit.insertMany([
      { nom: 'Aubergine', cat: 'Légumes', prix: 300, stock: 80,  img: '/images/aubergine.jpg' },
      { nom: 'Chou', cat: 'Légumes', prix: 500, stock: 60, img: '/images/chou.jpg' },
      { nom: 'Papaye', cat: 'Fruits', prix: 600, stock: 40, img: '/images/papaye.jpg' },
      { nom: 'Mangue', cat: 'Fruits', prix: 100, stock: 200, img: '/images/mangue.jpg' },
      { nom: 'Oignon Rouge', cat: 'Légumes', prix: 400, stock: 120, img: '/images/oignon.jpg' },
      { nom: 'Piment Fort', cat: 'Épices', prix: 200, stock: 90, img: '/images/piment.jpg' },
      { nom: 'Citron', cat: 'Fruits', prix: 100, stock: 150, img: '/images/citron.png' },
      { nom: 'Bissap séché', cat: 'Épices', prix: 800, stock: 70, img: '/images/bissap.png' },
      { nom: 'Poivron', cat: 'Légumes', prix: 350, stock: 55, img: '/images/poivron.jpg' },
      { nom: 'Banane Plantain', cat: 'Fruits', prix: 150, stock: 100, img: '/images/banane.png' },
      { nom: 'Confiture Goyave', cat: 'Confitures', prix: 2200, stock: 25, img: '/images/confiture_goyave.png' },
    ]);

    await Utilisateur.deleteOne({ email: 'admin@terroir.sn' });

    await Utilisateur.create({
      nom: 'Admin',
      email: 'admin@terroir.sn',
      password: 'admin1234',
      role: 'admin'
    });

    res.json({ success: true, message: 'Base de données initialisée !' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Page frontend (React/HTML fallback) ───────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Erreurs ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// ── Connexion MongoDB ────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message);
    process.exit(1);
  });