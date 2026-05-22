require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const https     = require('https');
const http      = require('http');

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
  res.json({ success: true, message: 'Terroir Sénégal API opérationnelle 🌿' });
});
app.get('/api/debug', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync(path.join(__dirname));
  res.json({ dirname: __dirname, files });
});
app.get('/api/debug2', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync(path.join(__dirname, 'public'));
  res.json({ files });
});

// ── SEED ──────────────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  try {
    const Produit = require('./models/Produit');
    const Utilisateur = require('./models/Utilisateur');

    await Produit.deleteMany({});
    await Produit.insertMany([
      { nom: 'Aubergine',        cat: 'Légumes',    prix: 300,  stock: 80,  img: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600&q=85&fit=crop' },
      { nom: 'Chou',             cat: 'Légumes',    prix: 500,  stock: 60,  img: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=85&fit=crop' },
      { nom: 'Papaye',           cat: 'Fruits',     prix: 600,  stock: 40,  img: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600&q=85&fit=crop' },
      { nom: 'Mangue',           cat: 'Fruits',     prix: 100,  stock: 200, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=85&fit=crop' },
      { nom: 'Oignon Rouge',     cat: 'Légumes',    prix: 400,  stock: 120, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=85&fit=crop' },
      { nom: 'Piment Fort',      cat: 'Épices',     prix: 200,  stock: 90,  img: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=85&fit=crop' },
      { nom: 'Confiture Mangue', cat: 'Confitures', prix: 2500, stock: 30,  img: 'https://images.unsplash.com/photo-1597528380253-e8b7d384d2e2?w=600&q=85&fit=crop' },
      { nom: 'Citron',           cat: 'Fruits',     prix: 100,  stock: 150, img: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&q=85&fit=crop' },
      { nom: 'Bissap séché',     cat: 'Épices',     prix: 800,  stock: 70,  img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=85&fit=crop' },
      { nom: 'Poivron',          cat: 'Légumes',    prix: 350,  stock: 55,  img: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=600&q=85&fit=crop' },
      { nom: 'Banane Plantain',  cat: 'Fruits',     prix: 150,  stock: 100, img: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&q=85&fit=crop' },
      { nom: 'Confiture Goyave', cat: 'Confitures', prix: 2200, stock: 25,  img: 'https://images.unsplash.com/photo-1562529536-5b00c4c50d88?w=600&q=85&fit=crop' },
    ]);

    await Utilisateur.deleteOne({ email: 'admin@terroir.sn' });
    await Utilisateur.create({ nom: 'Admin', email: 'admin@terroir.sn', password: 'admin1234', role: 'admin' });

    res.json({ success: true, message: 'Base de données initialisée avec images !' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Page frontend fallback ────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Erreurs ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// ── Connexion MongoDB ─────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur port ${PORT}`);

      // ── AUTO-PING : empêche Render de s'endormir ──────
      // Se ping toutes les 10 minutes sur /api/health
      const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
      const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

      setInterval(() => {
        const lib = APP_URL.startsWith('https') ? https : http;
        lib.get(`${APP_URL}/api/health`, (res) => {
          console.log(`🏓 Auto-ping OK — ${new Date().toLocaleTimeString('fr-FR')} (status ${res.statusCode})`);
        }).on('error', (err) => {
          console.warn('⚠️  Auto-ping échoué :', err.message);
        });
      }, PING_INTERVAL);

      console.log(`🏓 Auto-ping activé toutes les 10 min → ${APP_URL}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message);
    process.exit(1);
    mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur
  });
