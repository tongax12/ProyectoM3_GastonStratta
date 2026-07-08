/**
 * theme-init.js
 * Aplica el tema guardado (o la preferencia del sistema) ANTES de que
 * se pinte la página, para evitar el flash del tema equivocado.
 *
 * IMPORTANTE: se referencia en index.html como <script src="..."></script>
 * normal, SIN type="module" y SIN defer/async — tiene que ejecutar de
 * forma síncrona y bloqueante, antes del <link> de estilos. Si se carga
 * como módulo o diferido, deja de cumplir su función.
 */
(function () {
  try {
    var saved = localStorage.getItem('charchat:theme');
    var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // localStorage no disponible (ej: navegación privada muy restrictiva) — se queda con el tema claro por defecto
  }
})();