/**
 * navigation.js
 * Intercepta clicks en enlaces internos (data-link) para navegar sin
 * recargar la página, delegando en navigate() de router.js.
 */
import { navigate } from './router.js';

function handleClick(event) {
  const link = event.target.closest('[data-link]');
  if (!link) return;

  // Permitir abrir en pestaña nueva / clicks modificados
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//')) return;

  event.preventDefault();
  navigate(href);
}

export function setupLinkInterception() {
  document.addEventListener('click', handleClick);
}