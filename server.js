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
