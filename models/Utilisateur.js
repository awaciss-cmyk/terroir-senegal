const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: String,
  email: { type: String, unique: true },
  password: String,
  telephone: String,
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);