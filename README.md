# API de Gestión de Almacén - Sala "El Recreo"

API desarrollada con **Node.js y Express** para la gestión integral del stock, reposición mediante pedidos a proveedores y previsión de consumo para eventos en una sala de eventos, cumpliendo estrictamente con los principios de programación funcional mediante métodos de arrays puros (`map`, `filter`, `reduce`, `some`) sin utilizar bucles.


## Diseño de las Colecciones (Justificación)

El sistema se compone de tres colecciones principales estructuradas en archivos independientes dentro de `src/data/`:

1. **Productos (`productos.data.js`)**
   * *Justificación:* Almacena el catálogo de inventario base. Cada producto incluye identificación, categoría (`bebida`, `comida`, `otros`), unidad de recuento, stock actual, stock mínimo de seguridad, parámetros de compra por cajas (unidades por caja y precio) y los datos de contacto del proveedor. Esto permite automatizar tanto las compras como los cálculos de consumo.
2. **Pedidos (`pedidos.data.js`)**
   * *Justificación:* Registra las compras de reposición de mercancía solicitadas a los proveedores. Permite controlar líneas de productos, importes calculados de forma dinámica y estados (`pendiente` / `entregado`), actualizando automáticamente el stock del almacén al recibirse.
3. **Eventos (`eventos.data.js`)**
   * *Justificación:* Gestiona las celebraciones previstas en la sala. Asocia un número de asistentes a una previsión de consumo de productos, permitiendo validar la viabilidad del stock antes del evento y descontarlo de forma automatizada.
