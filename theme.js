/**
 * theme.js
 * Modo claro/oscuro persistido en localStorage, para que se mantenga
 * seleccionado entre visitas.
 *
 * El tema se aplica como atributo data-theme en <html>. La primera
 * aplicación (para evitar el flash del tema equivocado) la hace un
 * script inline en index.html, ANTES de que este módulo cargue; este
 * archivo solo se encarga de sincronizar el botón y manejar el toggle.
 */
const STORAGE_KEY = 'charchat:theme';

function getSystemPreference() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null; // localStorage no disponible (navegación privada muy restrictiva, etc.)
  }
}

function persistTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    // no se pudo guardar; el tema igual se aplica para esta sesión
  }
}

function updateToggleButtons(theme) {
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateToggleButtons(theme);
}

/**
 * Sincroniza el estado de los botones con el tema ya aplicado (el
 * script inline de index.html ya seteó el atributo data-theme antes
 * de que esto corra) y engancha el click del/de los botones toggle.
 */
export function initTheme() {
  const current = document.documentElement.getAttribute('data-theme') || readStoredTheme() || getSystemPreference();
  applyTheme(current);

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    applyTheme(next);
  });
}