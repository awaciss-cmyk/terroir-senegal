require('dotenv').config();

const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const https     = require('https');
const http      = require('http');

const authRoutes      = require('./routes/auth');
const produitsRoutes  = require('./routes/produits');
const commandesRoutes = require('./routes/commandes');
const statsRoutes     = require('./routes/stats');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ──
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/stats', statsRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Terroir Sénégal API opérationnelle 🌿'
  });
});

// ── DEBUG ──
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

// ── SEED (init data) ──
app.get('/api/seed', async (req, res) => {
  try {
    const Produit = require('./models/Produit');
    const Utilisateur = require('./models/Utilisateur');

    await Produit.deleteMany({});

    await Produit.insertMany([
      { nom: 'Aubergine', cat: 'Légumes', prix: 300, stock: 80, img: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600' },
      { nom: 'Chou', cat: 'Légumes', prix: 500, stock: 60, img: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600' },
      { nom: 'Papaye', cat: 'Fruits', prix: 600, stock: 40, img: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600' },
      { nom: 'Mangue', cat: 'Fruits', prix: 100, stock: 200, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600' }
    ]);

    await Utilisateur.deleteOne({ email: 'admin@terroir.sn' });

    await Utilisateur.create({
      nom: 'Admin',
      email: 'admin@terroir.sn',
      password: 'admin1234',
      role: 'admin'
    });

    res.json({
      success: true,
      message: 'Base de données initialisée 🌱'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ── Frontend fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// ── MongoDB CONNECTION (CORRIGÉ) ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur port ${PORT}`);

      const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
      const PING_INTERVAL = 10 * 60 * 1000;

      setInterval(() => {
        const lib = APP_URL.startsWith('https') ? https : http;

        lib.get(`${APP_URL}/api/health`, (res) => {
          console.log(`🏓 Auto-ping OK (${res.statusCode})`);
        }).on('error', (err) => {
          console.warn('⚠️ Auto-ping échoué:', err.message);
        });

      }, PING_INTERVAL);

      console.log(`🏓 Auto-ping activé → ${APP_URL}/api/health`);
    });

  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message);
    process.exit(1);
  });
