const express = require('express');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const router = express.Router();

// 🔑 TOKEN
function genererToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

// 🟢 REGISTER
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, telephone } = req.body;

    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return res.status(409).json({ success: false, message: "Email déjà utilisé" });
    }

    const user = await Utilisateur.create({
      nom,
      email,
      password,
      telephone
    });

    res.status(201).json({
      success: true,
      token: genererToken(user._id),
      user
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔵 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Utilisateur.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    res.json({
      success: true,
      token: genererToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;