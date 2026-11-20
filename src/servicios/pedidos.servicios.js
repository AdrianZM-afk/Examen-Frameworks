const pedidos = require('../data/pedidos.data');
const productos = require('../data/productos.data');


const obtenerPedidosService = (pendiente) => {
  let resultado = [...pedidos];

  if (pendiente !== undefined) {
    const esPendiente = pendiente === "true";
    resultado = resultado.filter(p => (p.estado === "pendiente") === esPendiente);
  }

  return [...resultado].sort((a, b) => b.id - a.id);
};


const obtenerPedidoPorIdService = (buscarId) => {
  const pedido = pedidos.find(p => p.id === buscarId);
  if (!pedido) return null;

  const lineasConNombre = pedido.lineas.map(linea => {
    const productoEncontrado = productos.find(prod => prod.id === linea.productoId);
    return {
      ...linea,
      nombreProducto: productoEncontrado ? productoEncontrado.nombre : "Producto desconocido"
    };
  });

  return {
    ...pedido,
    lineas: lineasConNombre
  };
};


const validarLineasPedido = (lineas) => {
  if (!Array.isArray(lineas) || lineas.length === 0) return false;

  return !lineas.some(linea => {
    const productoEncontrado = productos.find(p => p.id === Number(linea.productoId));
    return !productoEncontrado || !Number.isInteger(linea.cajas) || linea.cajas <= 0;
  });
};


const crearPedidoManualService = (lineas) => {
  const importeTotal = lineas.reduce((total, linea) => {
    const productoEncontrado = productos.find(p => p.id === Number(linea.productoId));
    return total + (linea.cajas * productoEncontrado.precio);
  }, 0);

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const nuevoPedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    fecha: fechaHoy,
    lineas: lineas.map(l => ({
      productoId: Number(l.productoId),
      cajas: Number(l.cajas),
    })),
    importe: Math.round(importeTotal * 100) / 100,
    estado: "pendiente"
  };

  pedidos.push(nuevoPedido);
  return nuevoPedido;
};


const crearPedidoAutomaticoService = () => {
  const productoAenviar = productos.filter(p => p.stock <= p.minimo);

  if (productoAenviar.length === 0) return null;

  const lineasAutomaticas = productoAenviar.map(p => {
    const unidadesFaltantes = (p.minimo * 2) - p.stock;
    const cajasNecesarias = Math.ceil(unidadesFaltantes / p.unidadesPorCaja);

    return {
      productoId: p.id,
      cajas: cajasNecesarias > 0 ? cajasNecesarias : 1
    };
  });

  const importeTotal = lineasAutomaticas.reduce((total, linea) => {
    const productoEncontrado = productos.find(p => p.id === linea.productoId);
    return total + (linea.cajas * productoEncontrado.precio);
  }, 0);

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const nuevoPedido = {
    id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
    fecha: fechaHoy,
    lineas: lineasAutomaticas,
    importe: Math.round(importeTotal * 100) / 100,
    estado: "pendiente"
  };

  pedidos.push(nuevoPedido);
  return nuevoPedido;
};


const recibirPedidoService = (buscarId) => {
  const pedido = pedidos.find(p => p.id === buscarId);
  if (!pedido) return { status: 404, error: "Pedido no encontrado" };
  if (pedido.estado === "recibido") return { status: 409, error: "Pedido ya recibido anteriormente" };

  pedido.estado = "recibido";

  pedido.lineas.map(linea => {
    const productoEncontrado = productos.find(p => p.id === linea.productoId);
    if (productoEncontrado) {
      // Suma al almacén las cajas por las unidades de cada caja
      productoEncontrado.stock += (linea.cajas * productoEncontrado.unidadesPorCaja);
    }
    return linea;
  });

  return { status: 200, pedido };
};

module.exports = {
  obtenerPedidosService,
  obtenerPedidoPorIdService,
  validarLineasPedido,
  crearPedidoManualService,
  crearPedidoAutomaticoService,
  recibirPedidoService
};