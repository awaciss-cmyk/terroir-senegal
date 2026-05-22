const express = require('express');
const router = express.Router';
const jwt = require('jsonwebtoken');

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";

router.post('/login', (req, res) => {

  const { email, password } = req.body;

  if(email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD){
    return res.status(401).json({
      success:false,
      message:"Email ou mot de passe incorrect"
    });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: '7d' }
  );

  res.json({
    success:true,
    token
  });

});

module.exports = router();
