const productos = require('../data/productos.data');
const pedidos = require('../data/pedidos.data');

// Listar productos con filtros opcionales de categoría y stock bajo mínimo
const obtenerProductosService = (categoria, bajoMinimo) => {
  let resultado = [...productos];

  if (categoria) {
    resultado = resultado.filter(p => p.categoria === categoria);
  }
  if (bajoMinimo === 'true') {
    resultado = resultado.filter(p => p.stock <= p.minimo);
  }

  return resultado;
};

// Obtener un producto por ID
const obtenerProductoPorIdService = (idNum) => {
  return productos.find(p => p.id === idNum);
};

// Crear un nuevo producto
const crearProductoService = (data) => {
  const { nombre, categoria, unidad, stock, minimo, unidadesPorCaja, precio, proveedor } = data;

  if (!nombre || precio === undefined || stock === undefined) {
    return { status: 400, error: "Faltan campos obligatorios (nombre, precio, stock)" };
  }

  const existe = productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return { status: 400, error: "El producto ya existe en el catálogo" };
  }

  const nuevoProducto = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre,
    categoria: categoria || "otros",
    unidad: unidad || "unidades",
    stock: Number(stock),
    minimo: Number(minimo || 0),
    unidadesPorCaja: Number(unidadesPorCaja || 1),
    precio: Number(precio),
    proveedor: proveedor || { nombre: "Desconocido", telefono: "" }
  };

  productos.push(nuevoProducto);
  return { status: 201, producto: nuevoProducto };
};

// Actualizar producto (PUT / PATCH)
const actualizarProductoService = (idNum, data) => {
  const index = productos.findIndex(p => p.id === idNum);
  if (index === -1) {
    return { status: 404, error: "Producto no encontrado" };
  }

  productos[index] = {
    ...productos[index],
    ...(data.nombre !== undefined && { nombre: data.nombre }),
    ...(data.categoria !== undefined && { categoria: data.categoria }),
    ...(data.unidad !== undefined && { unidad: data.unidad }),
    ...(data.stock !== undefined && { stock: Number(data.stock) }),
    ...(data.minimo !== undefined && { minimo: Number(data.minimo) }),
    ...(data.unidadesPorCaja !== undefined && { unidadesPorCaja: Number(data.unidadesPorCaja) }),
    ...(data.precio !== undefined && { precio: Number(data.precio) }),
    ...(data.proveedor !== undefined && { proveedor: data.proveedor })
  };

  return { status: 200, producto: productos[index] };
};

// Eliminar producto con validación de pedidos pendientes (409)
const eliminarProductoService = (idNum) => {
  const index = productos.findIndex(p => p.id === idNum);
  if (index === -1){
    return { status: 404, error: "Producto no encontrado" };
  }

  const enPedidoPendiente = pedidos.some(pedido => 
    pedido.estado === "pendiente" && pedido.lineas.some(l => l.productoId === idNum)
  );

  if (enPedidoPendiente) {
    return { status: 409, error: "No se puede eliminar el producto porque aparece en un pedido pendiente" };
  }

  const eliminado = productos.splice(index, 1);
  return { status: 200, producto: eliminado[0] };
};

// Calcular el valor del almacén en total y por categoría
const obtenerValorAlmacenService = () => {
  const porCategoria = productos.reduce((acc, p) => {
    const precioUnidad = p.precio / p.unidadesPorCaja;
    const valorProducto = p.stock * precioUnidad;
    acc[p.categoria] = (acc[p.categoria] || 0) + valorProducto;
    return acc;
  }, {});

  const total = Object.values(porCategoria).reduce((a, b) => a + b, 0);

  return {
    total: Math.round(total * 100) / 100,
    porCategoria: Object.fromEntries(
      Object.entries(porCategoria).map(([cat, val]) => [cat, Math.round(val * 100) / 100])
    )
  };
};

module.exports = {
  obtenerProductosService,
  obtenerProductoPorIdService,
  crearProductoService,
  actualizarProductoService,
  eliminarProductoService,
  obtenerValorAlmacenService
};