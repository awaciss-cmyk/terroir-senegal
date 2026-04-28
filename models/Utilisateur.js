const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom:       { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  telephone: { type: String, default: '' },
  role:      { type: String, enum: ['client', 'admin'], default: 'client' },
}, { timestamps: true });

// Hasher le mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparer le mot de passe
utilisateurSchema.methods.verifierPassword = function (motDePasse) {
  return bcrypt.compare(motDePasse, this.password);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
