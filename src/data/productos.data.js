const productos = [
  {
    id: 1,
    nombre: "cerveza",
    categoria: "bebida",
    unidad: "latas",
    stock: 200,
    minimo: 50,
    unidadesPorCaja: 24,
    precio: 23.99, // Precio de la caja
    proveedor: {
      nombre: "Distribuciones Bebidas S.L.",
      telefono: "912345678"
    }
  },
  {
    id: 2,
    nombre: "coca cola",
    categoria: "bebida",
    unidad: "botellas",
    stock: 40,
    minimo: 50,
    unidadesPorCaja: 12,
    precio: 20.99,
    proveedor: {
      nombre: "Distribuciones Bebidas S.L.",
      telefono: "993894890"
    }
  },
  {
    id: 3,
    nombre: "agua mineral",
    categoria: "bebida",
    unidad: "botellas",
    stock: 100,
    minimo: 30,
    unidadesPorCaja: 20,
    precio: 12.99,
    proveedor: {
      nombre: "Aguas del Norte",
      telefono: "987236483"
    }
  },
  {
    id: 4,
    nombre: "pincho de jamon",
    categoria: "comida",
    unidad: "raciones",
    stock: 65,
    minimo: 40,
    unidadesPorCaja: 15,
    precio: 11.99,
    proveedor: {
      nombre: "Catering Express",
      telefono: "903089348"
    }
  },
  {
    id: 5,
    nombre: "bolsa de patatas fritas",
    categoria: "comida",
    unidad: "paquetes",
    stock: 80,
    minimo: 30,
    unidadesPorCaja: 10,
    precio: 12.00,
    proveedor: {
      nombre: "Snacks S.A.",
      telefono: "983873882"
    }
  }
];

module.exports = productos;