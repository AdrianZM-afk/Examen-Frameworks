const express = require('express');
const router = express.Router();

// Ruta de prueba temporal
router.get('/', (req, res) => {
  res.json({ mensaje: "Ruta funcionando correctamente" });
});

module.exports = router;