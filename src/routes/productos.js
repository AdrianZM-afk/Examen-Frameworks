const express = require('express');
const router = express.Router();
const {
  obtenerProductosService,
  obtenerProductoPorIdService,
  crearProductoService,
  actualizarProductoService,
  eliminarProductoService,
  obtenerValorAlmacenService
} = require('../servicios/productos.servicios');

// RUTA FIJA /valor (Debe ir siempre antes de /:id)
router.get('/valor', (req, res) => {
  res.json(obtenerValorAlmacenService());
});

// GET /api/productos (Admite ?categoria=bebida y ?bajoMinimo=true)
router.get('/', (req, res) => {
  const { categoria, bajoMinimo } = req.query;
  res.json(obtenerProductosService(categoria, bajoMinimo));
});

// GET /api/productos/:id
router.get('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: "El ID debe ser un número entero" });

  const producto = obtenerProductoPorIdService(idNum);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

  res.json(producto);
});

// POST /api/productos
router.post('/', (req, res) => {
  const resultado = crearProductoService(req.body);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.status(201).json({ mensaje: "Producto creado con éxito", producto: resultado.producto });
});

// PUT / PATCH /api/productos/:id
router.patch('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: "El ID debe ser un número entero" });

  const resultado = actualizarProductoService(idNum, req.body);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.json({ mensaje: "Producto actualizado con éxito", producto: resultado.producto });
});

router.put('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: "El ID debe ser un número entero" });

  const resultado = actualizarProductoService(idNum, req.body);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.json({ mensaje: "Producto actualizado con éxito", producto: resultado.producto });
});

// DELETE /api/productos/:id (Devuelve 204 sin cuerpo o 404/409)
router.delete('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: "El ID debe ser un número entero" });

  const resultado = eliminarProductoService(idNum);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.status(204).send();
});

module.exports = router;