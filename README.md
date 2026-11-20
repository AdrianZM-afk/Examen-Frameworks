## Cómo Usar el Programa

1. **Pruebas con REST Client:** 
   - En la raíz del proyecto encontrarás el archivo `peticiones.http`.
   - Abre el archivo en Visual Studio Code con la extensión *REST Client* instalada para probar todos los endpoints de Productos, Pedidos y Eventos, incluyendo los casos de éxito y los códigos de error (**400, 404, 409**).
2. **Consultas y Filtros:** 
   - Puedes usar los parámetros en la URL (como `?pendiente=true`, `?tipo=concierto`, `?orden=balance&dir=desc`, o `pagina=1&limite=5`) directamente desde cualquier cliente HTTP.