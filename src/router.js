/**
 * router.js
 * Router SPA minimalista basado en la History API (pushState/popstate).
 *
 * Patrón simple: router() es una función que lee la URL actual y
 * renderiza la vista correspondiente en #view-root. Se llama en
 * 'popstate' y al arrancar la app (ver main.js). navigate() actualiza
 * el historial y vuelve a llamar a router().
 */
import { render as renderHome } from './views/home.js';
import { render as renderChat } from './views/chat.js';
import { render as renderAbout } from './views/about.js';
import { render as renderNotFound } from './views/notfound.js';

const routes = { home: renderHome, chat: renderChat, about: renderAbout };

let beforeLeave = null; // hook opcional que la vista activa puede registrar

/** La vista activa puede registrar una función de limpieza antes de cambiar de ruta. */
export function setBeforeLeave(fn) {
  beforeLeave = fn;
}

/**
 * Limpia un pathname y devuelve el nombre de ruta a usar.
 * Saca barras de más al principio, al final, o repetidas en el medio
 * (ej: "/chat/" -> "chat", "//about//" -> "about", "" -> "home").
 */
function parsePath(pathname) {
  const segments = pathname.split('/').filter(Boolean); // saca segmentos vacíos (barras de más)
  if (segments.length === 0 || segments[0] === 'index.html') return 'home';
  return segments[0];
}

function updateActiveNav(routeName) {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.route === routeName);
    if (el.dataset.route === routeName) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

/**
 * Lee la URL actual y renderiza la vista correspondiente en #view-root.
 * Se llama en 'popstate' (ver main.js) y cada vez que navigate() cambia
 * la URL.
 */
export function router() {
  // Normaliza la barra de direcciones: "/" -> "/home"
  if (window.location.pathname === '/') {
    history.replaceState({}, '', '/home' + window.location.search);
  }

  const name = parsePath(window.location.pathname);
  const routeName = routes[name] ? name : 'notfound';
  const params = Object.fromEntries(new URL(window.location.href).searchParams.entries());

  if (typeof beforeLeave === 'function') {
    try { beforeLeave(); } catch (e) { /* no-op */ }
    beforeLeave = null;
  }

  updateActiveNav(routeName);

  const viewRoot = document.getElementById('view-root');
  viewRoot.innerHTML = '';

  const renderFn = routes[name] || renderNotFound;
  renderFn(viewRoot, params);

  viewRoot.setAttribute('tabindex', '-1');
  viewRoot.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/**
 * Actualiza la URL (pushState/replaceState) y vuelve a renderizar
 * llamando a router(). La usan las vistas para navegar programáticamente
 * (ej: al elegir un personaje en Inicio).
 */
export function navigate(path, { replace = false } = {}) {
  const url = new URL(path, window.location.origin);
  if (replace) {
    history.replaceState({}, '', url.pathname + url.search);
  } else {
    history.pushState({}, '', url.pathname + url.search);
  }
  router();
}