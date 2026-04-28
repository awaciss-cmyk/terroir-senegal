const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom: String,
  email: { type: String, unique: true },
  password: String,
  telephone: String,
  role: { type: String, default: 'user' }
});

// 🔐 Hash automatique du mot de passe
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Vérifier mot de passe
utilisateurSchema.methods.verifierPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);