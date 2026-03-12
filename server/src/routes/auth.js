const { Router } = require('express');
const jwt = require('jsonwebtoken');

const router = Router();

router.post('/login', (req, res) => {
  const { user, password } = req.body;

  if (user === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }

  res.status(401).json({ error: 'Credenciales inválidas' });
});

module.exports = router;
