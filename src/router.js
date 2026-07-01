/**
 * router.js
 * Router SPA minimalista basado en la History API (pushState/popstate).
 *
 * - Intercepta clicks en enlaces internos (data-link) para evitar recargas.
 * - Soporta los botones Atrás/Adelante del navegador vía 'popstate'.
 * - Cada ruta se asocia a una función render(container, params) registrada
 *   por los módulos en js/views/*.js a través de Router.register().
 */
const Router = (() => {
  const routes = {};        // { 'home': renderFn, 'chat': renderFn, 'about': renderFn }
  let viewRoot = null;
  let currentRoute = null;
  let beforeLeave = null;   // hook opcional que la vista activa puede registrar

  function register(name, renderFn) {
    routes[name] = renderFn;
  }

  /** La vista activa puede registrar una función de limpieza antes de cambiar de ruta. */
  function setBeforeLeave(fn) {
    beforeLeave = fn;
  }

  function parsePath(pathname) {
    // normaliza "/", "/index.html", "" -> "home"
    const clean = pathname.replace(/^\/+|\/+$/g, '');
    if (clean === '' || clean === 'index.html') return 'home';
    return clean.split('/')[0];
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

  function render(routeName, params, options = {}) {
    const name = routes[routeName] ? routeName : 'home';

    if (typeof beforeLeave === 'function') {
      try { beforeLeave(); } catch (e) { /* no-op */ }
      beforeLeave = null;
    }

    currentRoute = name;
    updateActiveNav(name);

    const renderFn = routes[name];
    viewRoot.innerHTML = '';
    if (renderFn) {
      renderFn(viewRoot, params || {});
    } else {
      viewRoot.innerHTML = '<p class="not-found">Vista no encontrada.</p>';
    }

    if (!options.skipFocus) {
      viewRoot.setAttribute('tabindex', '-1');
      viewRoot.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function navigate(path, { replace = false, state = {} } = {}) {
    const url = new URL(path, window.location.origin);
    const routeName = parsePath(url.pathname);
    const params = Object.fromEntries(url.searchParams.entries());

    const historyState = { route: routeName, params, ...state };
    if (replace) {
      history.replaceState(historyState, '', url.pathname + url.search);
    } else {
      history.pushState(historyState, '', url.pathname + url.search);
    }
    render(routeName, params);
  }

  function handlePopState(event) {
    // Si no hay state (ej: primera carga manipulada manualmente), parseamos la URL actual
    const state = event.state || {
      route: parsePath(window.location.pathname),
      params: Object.fromEntries(new URL(window.location.href).searchParams.entries())
    };
    render(state.route, state.params, { skipFocus: true });
  }

  function interceptLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-link]');
      if (!link) return;

      // Permitir abrir en pestaña nueva / clicks modificados
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//')) return;

      event.preventDefault();
      navigate(href);
    });
  }

  function init(rootEl) {
    viewRoot = rootEl;
    interceptLinks();
    window.addEventListener('popstate', handlePopState);

    // Carga inicial: usamos la URL actual (permite deep-linking si el server
    // redirige todas las rutas a index.html)
    const initialPath = window.location.pathname === '/' ? '/home' : window.location.pathname;
    const url = new URL(initialPath, window.location.origin + window.location.search);
    const routeName = parsePath(window.location.pathname || '/home');
    const params = Object.fromEntries(new URL(window.location.href).searchParams.entries());

    history.replaceState({ route: routeName, params }, '', (window.location.pathname === '/' ? '/home' : window.location.pathname) + window.location.search);
    render(routeName, params, { skipFocus: true });
  }

  return { register, navigate, init, setBeforeLeave, get current() { return currentRoute; } };
})();
