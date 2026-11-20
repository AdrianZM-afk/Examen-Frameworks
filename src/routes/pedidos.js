const express = require('express');
const router = express.Router();
const {
  obtenerPedidosService,
  obtenerPedidoPorIdService,
  validarLineasPedido,
  crearPedidoManualService,
  crearPedidoAutomaticoService,
  recibirPedidoService
} = require('../services/pedidos.service');

// GET /api/pedidos
router.get('/', (req, res) => {
  const { pendiente } = req.query;
  const resultado = obtenerPedidosService(pendiente);
  res.json(resultado);
});

// GET /api/pedidos/:id
router.get('/:id', (req, res) => {
  const buscarId = Number(req.params.id);

  if (isNaN(buscarId)) {
    return res.status(400).json({ mensaje: "El ID debe ser un número entero" });
  }

  const pedido = obtenerPedidoPorIdService(buscarId);

  if (!pedido) {
    return res.status(404).json({ mensaje: "Pedido no encontrado" });
  }

  res.json(pedido);
});

// POST /api/pedidos (Manual)
router.post('/', (req, res) => {
  const { lineas } = req.body;

  if (!validarLineasPedido(lineas)) {
    return res.status(400).json({ mensaje: "El pedido debe tener al menos una línea válida o los productos no existen" });
  }

  const nuevoPedido = crearPedidoManualService(lineas);

  res.status(201).json({
    mensaje: "Pedido creado con éxito",
    pedido: nuevoPedido
  });
});

// POST /api/pedidos/automatico
router.post('/automatico', (req, res) => {
  const nuevoPedido = crearPedidoAutomaticoService();

  if (!nuevoPedido) {
    return res.status(200).json({ mensaje: "El stock está completo. No se requiere ningún pedido automático." });
  }

  res.status(201).json({
    mensaje: "Pedido automático generado con éxito",
    pedido: nuevoPedido
  });
});

// PATCH /api/pedidos/:id/recibir
router.patch('/:id/recibir', (req, res) => {
  const buscarId = Number(req.params.id);

  if (isNaN(buscarId)) {
    return res.status(400).json({ mensaje: "El ID debe ser un número entero" });
  }

  const resultado = recibirPedidoService(buscarId);

  if (resultado.error) {
    return res.status(resultado.status).json({ mensaje: resultado.error });
  }

  res.json({
    mensaje: "Pedido recibido con éxito y stock actualizado",
    pedido: resultado.pedido
  });
});

module.exports = router;