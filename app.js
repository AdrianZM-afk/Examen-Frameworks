const express = require('express');
const app = express();
const PORT = 3000;


const eventosRouter = require("./src/routes/eventos");
const pedidosRouter = require("./src/routes/pedidos");
const productosRouter = require("./src/routes/productos");

app.use(express.json());

app.use("/api/eventos", eventosRouter);
app.use("/api/pedidos", pedidosRouter);
app.use("/api/productos", productosRouter);


app.listen(3000, () => {
  console.log(`Servidor de la sala corriendo...`);
});
