# Arquitectura visual del frontend

## Capas CSS

- `css/style.css`: estructura global y navegación lateral.
- `css/design-system.css`: tokens visuales y reglas generales compartidas.
- `css/list-page.css`: tablas, búsqueda, acciones y formularios de páginas de lista.
- `css/details/`: componentes reutilizables de páginas de detalle.
- `css/ticket-page.css` y `css/ticket-detail-enhancements.css`: estilos propios del flujo de tickets.
- Las hojas de entidad, como `details/tool-detail.css`, contienen solo diferencias de esa pantalla.

## Orden de carga

1. `style.css`.
2. Hojas de los componentes compartidos que use la página.
3. Hojas específicas de la página o del flujo.
4. `design-system.css` al final para aplicar tokens y reglas de consistencia.

Las hojas se enlazan directamente desde el HTML. Evitar `@import` para conservar un orden de cascada visible y predecible.

## Estructura de página

- Listas: `<main class="list-page-container">`.
- Detalles CRUD: `<main class="detail-page-container">`.
- Detalle del ticket conserva su layout específico: `<main class="ticket-main">`.
- La navegación se monta en `#appNavigation` y el encabezado de entidad en `#pageHeader` o `#detailHeader`.

## Reglas para cambios nuevos

- Preferir las variables de `design-system.css` para color, tipografía, bordes y superficies.
- Agregar una variante a un componente compartido cuando el patrón se repita; evitar duplicarlo en HTML.
- Mantener los estilos propios de una entidad en su hoja dedicada.
- No añadir bloques `<style>` al HTML; crear o ampliar una hoja CSS con nombre por componente o flujo.
- Al cambiar estructura, preservar los IDs y clases que consulta el JavaScript.
