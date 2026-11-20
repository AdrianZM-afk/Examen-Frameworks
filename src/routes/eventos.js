const express = require('express');
const router = express.Router();
const eventos = require('../data/eventos.data');
const productos = require('../data/productos.data');

const {
  AFORO,
  PERSONAS_POR_CAMARERO,
  MINIMO_CAMAREROS,
  COSTE_CAMARERO,
  TIPOS
} = require('../config');

const calcularDatosEventos = (evento) => {
  if(evento.cancelado.estado){
    return {
      ...evento,
      camareros: 0,
      costePersonal: 0,
      costeArtistas: 0,
      ingresos: 0,
      balance: 0
    };
  }

  const camarerosBase = Math.ceil(evento.gentePrevista / PERSONAS_POR_CAMARERO);
  const camarerosMinimos = Math.max(MINIMO_CAMAREROS, camarerosBase);
  const extraFiesta = evento.tipo === "fiesta" ? 1 : 0;
  const camareros = camarerosMinimos + extraFiesta;

  const costePersonal = camareros * COSTE_CAMARERO;

  const costeArtistas = evento.artistas.reduce((total, artista) => total + artista.precio, 0);

  const recaudacionEntradas = evento.entrada.gratis ? 0 : (evento.entrada.precio * evento.gentePrevista);
  const ingresosAlquiler = evento.alquiler.seCobra ? evento.alquiler.importe : 0;
  const ingresos = recaudacionEntradas + ingresosAlquiler;

  const balance = ingresos - (costePersonal + costeArtistas);

  return {
    ...evento,
    camareros,
    costePersonal,
    costeArtistas,
    ingresos,
    balance
  };
};

router.get('/', (req, res) =>{
  const { 
    tipo, precioMin, precioMax, gratis, texto, etiqueta, 
    desde, hasta, organizador, artista, cancelado, 
    alquilerPendiente, minCamareros, orden, dir, campos, 
    pagina = 1, limite = 10 
  } = req.query;

  let resultado = eventos.map(e => calcularDatosEventos(e));

  if(tipo) {
    resultado = resultado.filter(e => e.tipo === tipo);
  }

  if(gratis !== undefined){
    const esGratis = gratis === "true";
    resultado = resultado.filter(e => e.entrada.gratis === esGratis);
  }

  if(precioMin !== undefined){
    resultado = resultado.filter(e => e.entrada.precio >= Number(precioMin));
  }

  if(precioMax !== undefined){
    resultado = resultado.filter(e => e.entrada.precio <= Number(precioMax)); 
  }

  if(texto){
    const textoMinus = texto.toLowerCase();
    resultado = resultado.filter(e =>
      e.titulo.toLowerCase().includes(textoMinus) || e.descripcion.toLowerCase().includes(textoMinus)
    );
  }

  if(etiqueta){
    resultado = resultado.filter(e => e.etiquetas.includes(etiqueta)); 
  }

  if(desde){
    resultado = resultado.filter(e => e.dia >= desde);
  }

  if(hasta){
    resultado = resultado.filter(e => e.dia <= hasta);
  }

  if(organizador){
    const orgMinus = organizador.toLowerCase();
    resultado = resultado.filter(e => e.organizador.Nombre.toLowerCase().includes(orgMinus));
  }

  if(artista){
    const artMinus = artista.toLowerCase();
    resultado = resultado.filter(e => e.artistas.some(a => a.nombre.toLowerCase().includes(artMinus))); 
  }
  
  if(cancelado !== undefined){
    const estaCancelado = cancelado === "true";
    resultado = resultado.filter(e => e.cancelado.estado === estaCancelado);
  }

  if(alquilerPendiente === "true"){
    resultado = resultado.filter(e => e.alquiler.seCobra && !e.alquiler.pagado);
  }

  if (minCamareros) {
    resultado = resultado.filter(e => e.camareros >= Number(minCamareros));
  }

  const total = resultado.length;

  if (orden) {
    const direccion = dir === 'desc' ? -1 : 1;
    resultado = [...resultado].sort((a, b) => {
      if (orden === 'fecha') {
        if (a.dia === b.dia) return (a.hora.localeCompare(b.hora)) * direccion;
        return (a.dia.localeCompare(b.dia)) * direccion;
      }
      if (a[orden] < b[orden]) return -1 * direccion;
      if (a[orden] > b[orden]) return 1 * direccion;
      return 0;
    });
  }

  const inicio = (Number(pagina) - 1) * Number(limite);
  const fin = inicio + Number(limite);
  resultado = resultado.slice(inicio, fin);

  if (campos) {
    const camposArray = campos.split(',');
    resultado = resultado.map(e => {
      const proyectado = { id: e.id };
      camposArray.forEach(campo => {
        if (e[campo] !== undefined) proyectado[campo] = e[campo];
      });
      return proyectado;
    });
  }

  res.json({
    total,
    pagina: Number(pagina),
    limite: Number(limite),
    datos: resultado
  });
});

router.get('/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) {
    return res.status(400).json({ error: 'El ID debe ser un número entero' });
  }

  const eventoEncontrado = eventos.find(e => e.id === idNum);
  if (!eventoEncontrado) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  res.json(calcularDatosEventos(eventoEncontrado));
});

module.exports = router;