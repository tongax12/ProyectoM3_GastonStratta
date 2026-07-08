/**
 * views/notfound.js
 * Vista de error 404: se muestra cuando la ruta no coincide con
 * ninguna de las rutas conocidas (home, chat, about).
 */
export function render(container) {
  container.innerHTML = `
    <section class="view view-notfound">
      <div class="hero">
        <p class="eyebrow">Error 404</p>
        <h1 class="hero-title">Esta página no existe</h1>
        <p class="hero-subtitle">
          La ruta a la que intentaste acceder no es válida. Volvé al inicio
          para elegir un personaje y empezar a chatear.
        </p>
        <a href="/home" class="btn btn-primary" data-link>Volver al inicio</a>
      </div>
    </section>
  `;
}