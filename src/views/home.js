/**
 * views/home.js
 * Vista de bienvenida: presenta el proyecto y permite elegir personaje
 * para empezar a chatear.
 */
(function () {
  function cardTemplate(character) {
    return `
      <article class="char-card" data-character="${character.id}" style="--c-primary:${character.palette.primary}; --c-secondary:${character.palette.secondary};">
        <div class="char-card-avatar" aria-hidden="true">${characterAvatarHTML(character)}</div>
        <h3 class="char-card-name">${character.name}</h3>
        <p class="char-card-tagline">${character.tagline}</p>
        <button class="btn btn-primary char-card-btn" type="button" data-start="${character.id}">
          Chateá con ${character.name.split(' ')[0]}
        </button>
      </article>
    `;
  }

  function render(container) {
    container.innerHTML = `
      <section class="view view-home">
        <div class="hero">
          <p class="eyebrow">CharChat</p>
          <h1 class="hero-title">Elegí un personaje y empezá a charlar</h1>
          <p class="hero-subtitle">
            Cuatro personalidades, cuatro estilos de conversación. Hablá de fútbol con Messi,
            de mentalidad ganadora con Djokovic, reíte con Shrek o asustá monstruos con Mike Wazowski.
          </p>
        </div>

        <div class="char-grid" role="list">
          ${CHARACTERS.map(cardTemplate).join('')}
        </div>
      </section>
    `;

    container.querySelectorAll('[data-start]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.start;
        sessionStorage.setItem('charchat:lastCharacter', id);
        Router.navigate(`/chat?character=${id}`);
      });
    });
  }

  Router.register('home', render);
})();