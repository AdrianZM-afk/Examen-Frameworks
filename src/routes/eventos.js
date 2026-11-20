const express = require('express');
const router = express.Router();
const {
  obtenerEventosService,
  obtenerEventoPorIdService,
  obtenerResumenService,
  obtenerDeudasService,
  obtenerActuacionesService,
  obtenerCalendarioService,
  obtenerPreguntasService,
  cancelarEventoService,
  pagarAlquilerService
} = require('../services/eventos.service');

// RUTAS FIJAS DE INFORMES (¡Siempre antes de /:id!)
router.get('/resumen', (req, res) => res.json(obtenerResumenService()));
router.get('/deudas', (req, res) => res.json(obtenerDeudasService()));
router.get('/actuaciones', (req, res) => res.json(obtenerActuacionesService()));
router.get('/calendario', (req, res) => {
  const { mes } = req.query;
  if (!mes) return res.status(400).json({ error: "El parámetro 'mes' (AAAA-MM) es obligatorio" });
  res.json(obtenerCalendarioService(mes));
});
router.get('/preguntas', (req, res) => res.json(obtenerPreguntasService()));

// GET /api/eventos
router.get('/', (req, res) => {
  res.json(obtenerEventosService(req.query));
});

// GET /api/eventos/:id
router.get('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'El ID debe ser un número entero' });

  const evento = obtenerEventoPorIdService(idNum);
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

  res.json(evento);
});

// PATCH /api/eventos/:id/cancelar
router.patch('/:id/cancelar', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'ID no válido' });

  const resultado = cancelarEventoService(idNum, req.body.motivo);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.json({ mensaje: "Evento cancelado con éxito", evento: resultado.evento });
});

// PATCH /api/eventos/:id/pagar-alquiler
router.patch('/:id/pagar-alquiler', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'ID no válido' });

  const resultado = pagarAlquilerService(idNum);
  if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

  res.json({ mensaje: "Alquiler marcado como pagado", evento: resultado.evento });
});

module.exports = router;