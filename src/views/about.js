/**
 * views/about.js
 * Información sobre el proyecto y los personajes elegidos.
 */
(function () {
  function paletteSwatches(character) {
    const colors = [
      ['Primario', character.palette.primary],
      ['Secundario', character.palette.secondary],
      ['Fondo', character.palette.bg],
      ['Superficie', character.palette.surface]
    ];
    return `
      <div class="swatch-row">
        ${colors.map(([label, hex]) => `
          <div class="swatch" title="${label}: ${hex}">
            <span class="swatch-color" style="background:${hex}"></span>
            <span class="swatch-label">${hex}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function render(container) {
    container.innerHTML = `
      <section class="view view-about">
        <div class="about-intro">
          <p class="eyebrow">Acerca de</p>
          <h1 class="hero-title">El proyecto</h1>
          <p class="hero-subtitle">
            CharChat es una Single Page Application construida con HTML, CSS y JavaScript puro
            (sin frameworks). Implementa ruteo del lado del cliente con la History API,
            navegación accesible y un diseño mobile-first que escala a tablet y desktop.
          </p>
        </div>

        <div class="about-grid">
          <article class="about-card">
            <h2>Stack técnico</h2>
            <ul class="about-list">
              <li><strong>HTML5</strong> semántico, con landmarks y soporte de teclado.</li>
              <li><strong>CSS3</strong> con variables custom por personaje y media queries mobile-first.</li>
              <li><strong>JavaScript vanilla</strong>: router propio sobre <code>pushState</code>/<code>popstate</code>.</li>
              <li>Sin dependencias externas ni build step: abrir y funcionar.</li>
            </ul>
          </article>

          <article class="about-card">
            <h2>Navegación SPA</h2>
            <p>
              Las rutas <code>/home</code>, <code>/chat</code> y <code>/about</code> se manejan
              sin recargar la página. Los botones atrás/adelante del navegador funcionan
              correctamente gracias al evento <code>popstate</code>, y cada cambio de personaje
              dentro del chat actualiza la URL mediante <code>history.replaceState</code>.
            </p>
          </article>
        </div>

        <h2 class="section-title">Los personajes</h2>
        <div class="char-about-grid">
          ${CHARACTERS.map((c) => `
            <article class="char-about-card" style="--c-primary:${c.palette.primary}">
              <div class="char-about-head">
                <span class="char-about-avatar" aria-hidden="true">${characterAvatarHTML(c)}</span>
                <div>
                  <h3>${c.name}</h3>
                  <p class="char-about-tagline">${c.tagline}</p>
                </div>
              </div>
              <p class="char-about-bio">${c.bio}</p>
              ${paletteSwatches(c)}
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  Router.register('about', render);
})();