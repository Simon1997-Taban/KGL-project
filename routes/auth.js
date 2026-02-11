const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).send('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.send('User registered');
});

module.exports = router;