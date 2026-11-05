const express = require('express');
const router = express.Router();

const productos = require('../data/productos.data.js');

router.get('/', (req, res) => {
  res.json(productos);
});


router.get('/:id', (req, res) => {

  const idBuscado = Number(req.params.id);

  const producto = productos.find(p => p.id === idBuscado);

  if (!producto){
    return res.status(404).json({mensaje: "Producto no encontrado"});
  }

  res.json(producto);
});

router.post('/', (req,res) => {
  const {nombre, precio, stock} = req.body;

  if (!nombre) {
    return res.status(400).json({ 
      mensaje: "El campo 'nombre' es obligatorio"
    });
  };

  if (precio === undefined ) {
    return res.status(400).json({ 
      mensaje: "El campo 'precio' es obligatorio" 
    });
  };

  if (stock === undefined) {
    return res.status(400).json({ 
      mensaje: "El campo 'stock' es obligatorio" 
    });
  };

  const existe = productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());

  if (existe) {
    return res.status(400).json({ 
      mensaje: "El producto ya existe en el catálogo" 
    });
  };

  const nuevoProducto = {
    id: productos.length + 1,
    nombre: nombre,
    precio: precio,
    stock: stock
  };

  productos.push(nuevoProducto);

  res.status(201).json({
    mensaje: "Producto creado con exito",
    producto: nuevoProducto
  });
});

router.put('/:id' , (req,res) => {
  const idBuscado = Number(req.params.id);

  const {nombre, precio, stock} = req.body;

  const posicion = productos.findIndex(p => p.id === idBuscado);

  if (posicion === -1) {
    return res.status(404).json({mensaje: "Producto no encontrado"});
  };

  productos[posicion] = {
    nombre: nombre !== undefined ? nombre : productos[posicion].nombre,
    precio: precio !== undefined ? precio : productos[posicion].precio,
    stock: stock !== undefined ? stock : productos[posicion].stock
  };

  res.json({
    mensaje: "Producto actualizado con exito",
    productos: productos[posicion]
  });
});

router.delete('/:id' , (req,res) => {
  const idBuscado = Number(req.params.id);

  const posicion = productos.findIndex(p => p.id === idBuscado);

  if (posicion === -1) {
    return res.status(404).json({ 
      mensaje: "Producto no encontrado para eliminar" 
    });
  };

  const eliminar = productos.splice(posicion, 1);

  res.json({
    mensaje: "Producto eliminado correctamente",
    producto: eliminar[0]
  });
});

module.exports = router;