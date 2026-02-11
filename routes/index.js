const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

router.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});