const pedidos = [{
    id: 1,
    fecha: "2026-09-28",
    lineas: [
        {productoId: 1, cajas: 2},
        {productoId: 3, cajas: 1}
    ],
    importe: 60,
    estado: "entregado",
},{
    id: 2,
    fecha: "2026-11-15",
    lineas: [
        {productoId: 2, cajas: 4}
    ],
    importe: 80,
    estado: "pendiente",
}];

module.exports = pedidos;