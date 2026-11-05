const express = require('express');
const router = express.Router();

const pedidos = require('../data/pedidos.data');
const productos = require('../data/productos.data');

router.get('/', (req, res) => {
  const {pendiente} = req.query;

  let resultado = [...pedidos];

  if(pendiente !== undefined){
    const esPendiente = pendiente === "true";
    resultado = resultado.filter(p => (p.estado === "pendiente") === esPendiente)
  }

  resultado = resultado.sort((a,b) => b.id - a.id);

  res.json(resultado);
});

router.get('/:id', (req,res) => {

  const buscarId = Number(req.params.id)

  if(isNaN(buscarId)){
    return res.status(400).json({mensaje: "El ID debe ser un numero entero"})
  }

  const pedido = pedidos.find(p => p.id === buscarId);

  if(!pedido){
    return res.status(404).json({mensaje: "Pedido no encontrado"})
  }

  const lineasConNombre = pedido.lineas.map(linea => {
    const productoEncontrado = productos.find(prod => prod.id === linea.productoId);

    return {
      ...linea,
      nombreProducto: productoEncontrado ? productoEncontrado.nombre : "Producto desconocido"
    };
  });

  res.json({
    ...pedido,
    lineas: lineasConNombre});
});

router.post('/', (req,res) => {
  const {lineas} = req.body;

  if(!Array.isArray(lineas) || lineas.length === 0){
    return res.status(400).json({mensaje: "El pedido debe tener al menos una linea"});
  };

  const hayError = lineas.some(linea => {
    const productoEncontrado = productos.find(p => p.id === Number(linea.productoId));
    return !productoEncontrado || !Number.isInteger(linea.cajas) || linea.cajas <= 0
  })

  if(hayError){
    return res.status(400).json({mensaje: "Uno o más productos no existen o la cantidad de cajas no es válida"});
  };

  const importeTotal = lineas.reduce((total,linea) => {
    const productoEncontrado = productos.find(p => p.id === Number(linea.productoId));
    return total + (linea.cajas * productoEncontrado.precio)}, 0);

  const fechaHoy = new Date().toISOString().slice(0,10);

  const nuevoPedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    fecha: fechaHoy,
    lineas: lineas.map(l => ({
      productoId: Number(l.productoId),
      cajas: Number(l.cajas),
    })
    ),
    importe: Math.round(importeTotal * 100) / 100,
    estado: "pendiente"
  };

  pedidos.push(nuevoPedido);

  res.status(201).json({mensaje: "Pedido creado con éxito",pedido: nuevoPedido});
});

router.post('/automatico', (req,res) => {
  const productoAenviar = productos.filter(p => p.stock <= p.minimo);

  if(productoAenviar.length === 0){
    return res.status(200).json({mensaje: "El stock está completo. No se requiere ningun pedido automático."});
  };

  const lineasAutomaticas = productoAenviar.map(p => {
    const unidadesFaltantes = (p.minimo * 2) - p.stock;
    const cajasNecesarias = Math.ceil(unidadesFaltantes / p.unidadesPorCaja);

    return {
      productoId: p.id,
      cajas: cajasNecesarias > 0 ? cajasNecesarias : 1
    };
  });

  const importeTotal = lineasAutomaticas.reduce((total,linea) => {
    const productoEncontrado = productos.find(p => p.id === linea.productoId);
    return total + (linea.cajas * productoEncontrado.precio)}, 0);

  const fechaHoy = new Date().toISOString().slice(0,10);

  const nuevoPedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    fecha: fechaHoy,
    lineas: lineasAutomaticas,
    importe: Math.round(importeTotal * 100) / 100,
    estado: "pendiente"
  };

  pedidos.push(nuevoPedido);

  res.status(201).json({mensaje: "Pedido automatico generado con éxito", pedido: nuevoPedido});
});

router.patch('/:id/recibir', (req, res) => {
  const buscarId = Number(req.params.id);

  if(isNaN(buscarId)){
    return res.status(400).json({mensaje: "El Id debe de ser un numero entero"});
  };

  const pedido = pedidos.find(p => p.id === buscarId);

  if(!pedido){
    return res.status(404).json({mensaje: "Pedido no encontrado"});
  };

  if(pedido.estado === "recibido"){
    return res.status(409).json({mensaje: "Pedido ya recibido anteriormente"});
  };

  pedido.estado = "recibido";

  pedido.lineas.map(linea => {
    const productoEncontrado = productos.find(p => p.id === linea.productoId);
    if(productoEncontrado){
      productoEncontrado.stock += linea.cajas;
    };

    return linea;
  })

  res.json({mensaje: "Pedido recibido con éxito y stock actualizado",pedido});

});

router.patch('/:id/recibir', (req, res) => {
  
});


module.exports = router; 