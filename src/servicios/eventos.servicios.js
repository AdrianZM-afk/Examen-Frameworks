const eventos = require('../data/eventos.data');
const productos = require('../data/productos.data');
const { 
  AFORO, 
  PERSONAS_POR_CAMARERO, 
  MINIMO_CAMAREROS, 
  COSTE_CAMARERO, 
  TIPOS 
} = require('../config');

// Función auxiliar pura para calcular datos derivados de un evento
const calcularDatosEvento = (evento) => {
  if (evento.cancelado.estado){
    return { ...evento, camareros: 0, costePersonal: 0, costeArtistas: 0, ingresos: 0, balance: 0 };
  }

  const camarerosBase = Math.ceil(evento.gentePrevista / PERSONAS_POR_CAMARERO);
  const camarerosMinimos = Math.max(MINIMO_CAMAREROS, camarerosBase);
  const extraFiesta = evento.tipo === 'fiesta' ? 1 : 0;
  const camareros = camarerosMinimos + extraFiesta;

  const costePersonal = camareros * COSTE_CAMARERO;
  const costeArtistas = evento.artistas.reduce((acc, a) => acc + a.precio, 0);

  const recaudacionEntradas = evento.entrada.gratis ? 0 : (evento.entrada.precio * evento.gentePrevista);
  const ingresosAlquiler = evento.alquiler.seCobra ? evento.alquiler.importe : 0;
  const ingresos = recaudacionEntradas + ingresosAlquiler;
  const balance = ingresos - (costePersonal + costeArtistas);

  return { ...evento, camareros, costePersonal, costeArtistas, ingresos, balance };
};

// Filtrado de eventos
const filtrarEventos = (resultado, query) => {
  const { tipo, precioMin, precioMax, gratis, texto, etiqueta, desde, hasta, organizador, artista, cancelado, alquilerPendiente, minCamareros } = query;
  let res = [...resultado];

  if (tipo){
    res = res.filter(e => e.tipo === tipo);
  }

  if (gratis !== undefined){
    res = res.filter(e => e.entrada.gratis === (gratis === 'true'));
  }

  if (precioMin !== undefined){
    res = res.filter(e => e.entrada.precio >= Number(precioMin));
  } 

  if (precioMax !== undefined){
    res = res.filter(e => e.entrada.precio <= Number(precioMax));
  }

  if (texto) {
    const t = texto.toLowerCase();
    res = res.filter(e => e.titulo.toLowerCase().includes(t) || e.descripcion.toLowerCase().includes(t));
  }
  
  if (etiqueta){
    res = res.filter(e => e.etiquetas.includes(etiqueta));
  }

  if (desde){
    res = res.filter(e => e.dia >= desde);
  }

  if (hasta){
    res = res.filter(e => e.dia <= hasta);
  }

  if (organizador) {
    const org = organizador.toLowerCase();
    res = res.filter(e => (e.organizador.nombre || e.organizador.Nombre).toLowerCase().includes(org));
  }

  if (artista){
    const art = artista.toLowerCase();
    res = res.filter(e => e.artistas.some(a => a.nombre.toLowerCase().includes(art)));
  }

  if (cancelado !== undefined){
      res = res.filter(e => e.cancelado.estado === (cancelado === 'true'));
  }  

  if (alquilerPendiente === 'true'){
      res = res.filter(e => e.alquiler.seCobra && !e.alquiler.pagado);
  }

  if (minCamareros){
      res = res.filter(e => e.camareros >= Number(minCamareros));
  }

  return res;
};

// Ordenación de eventos
const ordenarEventos = (resultado, orden, dir) => {
  if (!orden) return resultado;
  const direccion = dir === 'desc' ? -1 : 1;
  return [...resultado].sort((a, b) => {
    if (orden === 'fecha') {
      if (a.dia === b.dia) return a.hora.localeCompare(b.hora) * direccion;
      return a.dia.localeCompare(b.dia) * direccion;
    }
    if (a[orden] < b[orden]) return -1 * direccion;
    if (a[orden] > b[orden]) return 1 * direccion;
    return 0;
  });
};

// Proyección de campos
const proyectarEventos = (resultado, campos) => {
  if (!campos){
    return resultado;
  }
  
  const camposArray = campos.split(',');
  
  return resultado.map(e => {
    return camposArray.reduce((proyectado, campo) => {
      if (e[campo] !== undefined) {
        proyectado[campo] = e[campo];
      }
      return proyectado;
    }, { id: e.id });
  });
};

// Servicio principal de listado
const obtenerEventosService = (query) => {
  const { orden, dir, campos, pagina = 1, limite = 10 } = query;
  let resultado = eventos.map(e => calcularDatosEvento(e));
  resultado = filtrarEventos(resultado, query);
  const total = resultado.length;
  resultado = ordenarEventos(resultado, orden, dir);
  
  const inicio = (Number(pagina) - 1) * Number(limite);
  const fin = inicio + Number(limite);
  resultado = resultado.slice(inicio, fin);
  resultado = proyectarEventos(resultado, campos);

  return { total, pagina: Number(pagina), limite: Number(limite), datos: resultado };
};

// Obtener por ID
const obtenerEventoPorIdService = (idNum) => {
  const evento = eventos.find(e => e.id === idNum);
  return evento ? calcularDatosEvento(evento) : null;
};

// Informes y Acciones
const obtenerResumenService = () => {
  const calc = eventos.map(e => calcularDatosEvento(e));
  const noCancelados = calc.filter(e => !e.cancelado.estado);
  const mediaGente = noCancelados.length > 0 ? noCancelados.reduce((acc, e) => acc + e.gentePrevista, 0) / noCancelados.length : 0;
  const balanceTotal = noCancelados.reduce((acc, e) => acc + e.balance, 0);

  return {
    totalEventos: eventos.length,
    cancelados: calc.filter(e => e.cancelado.estado).length,
    celebrados: calc.filter(e => e.celebrado).length,
    mediaGentePrevista: Math.round(mediaGente * 100) / 100,
    balancePrevistoTotal: Math.round(balanceTotal * 100) / 100
  };
};

const obtenerDeudasService = () => {
  return eventos.map(e => calcularDatosEvento(e))
    .filter(e => e.alquiler.seCobra && !e.alquiler.pagado)
    .map(e => ({
      eventoId: e.id,
      titulo: e.titulo,
      organizador: e.organizador.nombre || e.organizador.Nombre,
      contacto: e.organizador.contacto,
      deuda: e.alquiler.importe
    }));
};

const obtenerActuacionesService = () => {
  return eventos.flatMap(e => e.artistas.map(a => ({ eventoId: e.id, tituloEvento: e.titulo, fecha: e.dia, ...a })))
    .sort((a, b) => b.precio - a.precio);
};

const obtenerCalendarioService = (mes) => {
  return eventos.filter(e => !e.cancelado.estado && e.dia.startsWith(mes))
    .sort((a, b) => a.dia.localeCompare(b.dia) || a.hora.localeCompare(b.hora))
    .map(e => ({ dia: e.dia, hora: e.hora, titulo: e.titulo, tipo: e.tipo }));
};

const obtenerPreguntasService = () => {
  const calc = eventos.map(e => calcularDatosEvento(e));
  return {
    hayAlquilerPendiente: calc.some(e => e.alquiler.seCobra && !e.alquiler.pagado),
    todoAlmacenSobreMinimo: productos.every(p => p.stock > p.minimo),
    todosEventosConArtistasTienenMasDeUno: eventos.every(e => e.artistas.length === 0 || e.artistas.length > 1)
  };
};

const cancelarEventoService = (idNum, motivo) => {
  const evento = eventos.find(e => e.id === idNum);
  if (!evento){
    return { status: 404, error: "Evento no encontrado" };
  }

  if (!motivo || motivo.trim() === ""){
    return { status: 400, error: "El motivo es obligatorio" };
  }


  if (evento.cancelado.estado || evento.celebrado){
    return { status: 409, error: "Ya está cancelado o celebrado" };
  }

  evento.cancelado = { estado: true, motivo };

  return { status: 200, evento: calcularDatosEvento(evento) };
};

const pagarAlquilerService = (idNum) => {
  const evento = eventos.find(e => e.id === idNum);
  if (!evento){
    return { status: 404, error: "Evento no encontrado" };
  }

  if (!evento.alquiler.seCobra || evento.alquiler.pagado) {
    return { status: 409, error: "No cobra alquiler o ya está pagado" };
  }


  evento.alquiler.pagado = true;

  return { status: 200, evento: calcularDatosEvento(evento) };
};

module.exports = {
  obtenerEventosService,
  obtenerEventoPorIdService,
  obtenerResumenService,
  obtenerDeudasService,
  obtenerActuacionesService,
  obtenerCalendarioService,
  obtenerPreguntasService,
  cancelarEventoService,
  pagarAlquilerService
};