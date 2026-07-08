/**
 * views/chat.js
 * Vista de chat: conversación con el personaje seleccionado.
 *
 * - El historial se guarda en memoria (objeto `conversations`), por lo que
 *   se mantiene mientras dure la sesión de la app pero se pierde al recargar.
 * - El fetch real al backend vive en services/fetchApi.js; acá solo se
 *   arma el payload (system prompt, messages) y se interpreta la respuesta.
 */
import { CHARACTERS, getCharacter, characterAvatarHTML, wireAvatarImages } from '../characters.js';
import { setBeforeLeave } from '../router.js';
import { normalizeAIResponse } from '../normalize.js';
import { fetchChatReply } from '../services/fetchApi.js';

// Historial en memoria, por personaje: { messiId: [ {role, text, ts} ] }
const conversations = {};
// Flags de "escribiendo..." por personaje, para no perder el estado al cambiar de tab
const typingState = {};

const USE_MOCK_AI = false; // true = respuestas de ejemplo locales, sin gastar cuota de la API

// Íconos en SVG (sin emojis), heredan el color del botón vía currentColor
const ICON_COPY = `
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;
const ICON_CHECK = `
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
       stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`;
const ICON_WARN = `
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 9v4"></path><path d="M12 17h.01"></path>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>
  </svg>`;

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function ensureConversation(characterId) {
  if (!conversations[characterId]) {
    const character = getCharacter(characterId);
    conversations[characterId] = [
      { role: 'character', text: character.greeting, ts: Date.now() }
    ];
  }
  return conversations[characterId];
}


/**
 * Pide la respuesta del personaje. Con USE_MOCK_AI en true usa el pool de
 * respuestas de ejemplo (para desarrollar sin gastar cuota de la API);
 * con USE_MOCK_AI en false llama a fetchChatReply (services/fetchApi.js),
 * que a su vez pega contra /api/functions y de ahí a Gemini.
 */
async function requestAIReply(characterId, history) {
  const character = getCharacter(characterId);

  if (USE_MOCK_AI) {
    const delay = 900 + Math.random() * 900;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // ~12% de probabilidad de error simulado, para poder probar el manejo de errores
        if (Math.random() < 0.12) {
          reject(new Error('No se pudo contactar al servicio de IA.'));
          return;
        }
        const pool = character.sample;
        resolve(pool[Math.floor(Math.random() * pool.length)]);
      }, delay);
    });
  }

  const raw = await fetchChatReply({
    characterId,
    messages: history.map((m) => ({
      role: m.role === 'character' ? 'assistant' : 'user',
      content: m.text
    }))
  });

  const { text } = normalizeAIResponse(raw);
  if (!text) {
    throw new Error('Respuesta vacía del servicio de IA.');
  }
  return text;
}

function messageBubble(msg, characterId, index) {
  const character = getCharacter(characterId);
  const isUser = msg.role === 'user';
  const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `
    <li class="msg ${isUser ? 'msg-user' : 'msg-character'}">
      ${!isUser ? `<span class="msg-avatar" aria-hidden="true">${characterAvatarHTML(character)}</span>` : ''}
      <div class="msg-bubble">
        <p class="msg-text">${escapeHTML(msg.text)}</p>
        <div class="msg-meta">
          <span class="msg-time">${time}</span>
          ${!isUser ? `
            <button class="msg-copy" type="button" data-copy-index="${index}" aria-label="Copiar mensaje" title="Copiar mensaje">
              <span class="msg-copy-icon" aria-hidden="true">${ICON_COPY}</span>
            </button>
          ` : ''}
        </div>
      </div>
    </li>
  `;
}

/** Copia texto al portapapeles, con fallback para navegadores/contextos sin Clipboard API. */
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function showCopyFeedback(btn, ok) {
  const icon = btn.querySelector('.msg-copy-icon');
  const originalLabel = btn.getAttribute('aria-label');
  icon.innerHTML = ok ? ICON_CHECK : ICON_WARN;
  btn.setAttribute('aria-label', ok ? 'Copiado' : 'No se pudo copiar');
  btn.classList.add(ok ? 'is-copied' : 'is-error');
  setTimeout(() => {
    icon.innerHTML = ICON_COPY;
    btn.setAttribute('aria-label', originalLabel);
    btn.classList.remove('is-copied', 'is-error');
  }, 1500);
}

function errorBubble(retryId) {
  return `
    <li class="msg msg-error">
      <div class="msg-bubble msg-bubble-error">
        <p class="msg-text">⚠️ No se pudo obtener la respuesta. Revisá tu conexión e intentá de nuevo.</p>
        <button class="btn btn-retry" type="button" data-retry="${retryId}">Reintentar</button>
      </div>
    </li>
  `;
}

export function render(container, params) {
  const initialId = params.character || sessionStorage.getItem('charchat:lastCharacter') || CHARACTERS[0].id;
  let activeId = getCharacter(initialId).id;
  sessionStorage.setItem('charchat:lastCharacter', activeId);

  container.innerHTML = `
    <section class="view view-chat" data-character="${activeId}">
      <div class="chat-shell">
        <div class="chat-sidebar" role="tablist" aria-label="Elegir personaje">
          ${CHARACTERS.map((c) => `
            <button class="chat-tab ${c.id === activeId ? 'is-active' : ''}"
                    type="button" role="tab"
                    aria-selected="${c.id === activeId}"
                    data-tab="${c.id}"
                    style="--c-primary:${c.palette.primary};">
              <span class="chat-tab-avatar" aria-hidden="true">${characterAvatarHTML(c)}</span>
              <span class="chat-tab-label">${c.name.split(' ')[0]}</span>
            </button>
          `).join('')}
        </div>

        <div class="chat-panel">
          <div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="true"></div>

          <header class="chat-header">
            <span class="chat-header-avatar" aria-hidden="true" id="chat-avatar"></span>
            <div>
              <h2 class="chat-header-name" id="chat-name"></h2>
              <p class="chat-header-status" id="chat-status">en línea</p>
            </div>
          </header>

          <ul class="chat-log" id="chat-log" aria-live="polite"></ul>

          <p class="typing-indicator" id="typing-indicator" hidden>
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            <span id="typing-label">escribiendo...</span>
          </p>

          <form class="chat-form" id="chat-form" autocomplete="off">
            <label for="chat-input" class="sr-only">Escribir mensaje</label>
            <textarea
              id="chat-input"
              class="chat-input"
              placeholder="Escribí tu mensaje..."
              rows="1"
              maxlength="500"
              required
            ></textarea>
            <button class="btn btn-send" type="submit" id="chat-send" aria-label="Enviar mensaje">
              <span aria-hidden="true">➤</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  `;
  wireAvatarImages(container);

  const root = container.querySelector('.view-chat');
  const log = container.querySelector('#chat-log');
  const form = container.querySelector('#chat-form');
  const input = container.querySelector('#chat-input');
  const typingEl = container.querySelector('#typing-indicator');
  const sendBtn = container.querySelector('#chat-send');

  const themeObserver = new MutationObserver(() => applyPalette(activeId));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  setBeforeLeave(() => {
    themeObserver.disconnect();
    document.body.style.background = '';
  });
  const typingLabel = container.querySelector('#typing-label');
  const toastContainer = container.querySelector('#toast-container');

  function showToast(message, variant = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // forzar reflow para que la transición de entrada se dispare
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 400); // fallback por si no dispara transitionend
    }, 2000);
  }

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function applyPalette(characterId) {
    const c = getCharacter(characterId);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    root.dataset.character = characterId;
    root.style.setProperty('--c-primary', c.palette.primary);
    root.style.setProperty('--c-secondary', c.palette.secondary);
    root.style.setProperty('--c-bg', isDark ? getCSSVar('--app-bg') : c.palette.bg);
    root.style.setProperty('--c-surface', isDark ? getCSSVar('--app-surface') : c.palette.surface);
    root.style.setProperty('--c-text', c.palette.text);
    root.style.setProperty('--c-on-primary', c.palette.onPrimary);
    document.body.style.background = `color-mix(in srgb, ${c.palette.primary} 38%, var(--app-bg))`;
    container.querySelector('#chat-avatar').innerHTML = characterAvatarHTML(c);
    wireAvatarImages(container);
    container.querySelector('#chat-name').textContent = c.name;
    typingLabel.textContent = `${c.name.split(' ')[0]} está escribiendo...`;
  }

  function scrollToBottom() {
    log.scrollTop = log.scrollHeight;
  }

  function renderLog(characterId) {
    const history = ensureConversation(characterId);
    log.innerHTML = history.map((m, i) => messageBubble(m, characterId, i)).join('');
    wireAvatarImages(log);
    if (typingState[characterId]) {
      typingEl.hidden = false;
    } else {
      typingEl.hidden = true;
    }
    scrollToBottom();
  }

  function setTabActive(characterId) {
    container.querySelectorAll('.chat-tab').forEach((tab) => {
      const isActive = tab.dataset.tab === characterId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function switchCharacter(characterId) {
    activeId = characterId;
    sessionStorage.setItem('charchat:lastCharacter', activeId);
    applyPalette(activeId);
    setTabActive(activeId);
    renderLog(activeId);
    input.focus();
  }

  async function sendMessage(text) {
    const characterId = activeId;
    const history = ensureConversation(characterId);
    history.push({ role: 'user', text, ts: Date.now() });
    renderLog(characterId);

    lockUI();

    typingState[characterId] = true;
    typingEl.hidden = (characterId !== activeId);
    scrollToBottom();

    try {
      const reply = await requestAIReply(characterId, history);
      typingState[characterId] = false;
      history.push({ role: 'character', text: reply, ts: Date.now() });
      if (characterId === activeId) renderLog(characterId);
    } catch (err) {
      typingState[characterId] = false;
      if (characterId === activeId) {
        typingEl.hidden = true;
        const retryId = `${characterId}-${Date.now()}`;
        log.insertAdjacentHTML('beforeend', errorBubble(retryId));
        log.querySelector(`[data-retry="${retryId}"]`).addEventListener('click', () => {
          log.querySelector(`[data-retry="${retryId}"]`).closest('.msg-error').remove();
          retrySend(characterId, text);
        });
        scrollToBottom();
      }
    } finally{
      unlockUI();
    }
  }

  async function retrySend(characterId, text) {
    lockUI();
    typingState[characterId] = true;
    if (characterId === activeId) {
      typingEl.hidden = false;
      scrollToBottom();
    }
    try {
      const history = ensureConversation(characterId);
      const reply = await requestAIReply(characterId, history);
      typingState[characterId] = false;
      history.push({ role: 'character', text: reply, ts: Date.now() });
      if (characterId === activeId) renderLog(characterId);
    } catch (err) {
      typingState[characterId] = false;
      if (characterId === activeId) {
        typingEl.hidden = true;
        const retryId = `${characterId}-${Date.now()}`;
        log.insertAdjacentHTML('beforeend', errorBubble(retryId));
        log.querySelector(`[data-retry="${retryId}"]`).addEventListener('click', () => {
          log.querySelector(`[data-retry="${retryId}"]`).closest('.msg-error').remove();
          retrySend(characterId, text);
        });
        scrollToBottom();
      }
    }
    finally{
      unlockUI();
    }
  }

  // --- Eventos ---
  log.addEventListener('click', async (event) => {
    const btn = event.target.closest('.msg-copy');
    if (!btn) return;
    const index = Number(btn.dataset.copyIndex);
    const history = ensureConversation(activeId);
    const text = history[index] && history[index].text;
    if (!text) return;
    try {
      await copyToClipboard(text);
      showCopyFeedback(btn, true);
      showToast('Mensaje copiado con éxito', 'success');
    } catch (err) {
      showCopyFeedback(btn, false);
      showToast('No se pudo copiar el mensaje', 'error');
    }
  });

  container.querySelectorAll('.chat-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab !== activeId) {
        switchCharacter(tab.dataset.tab);
        // refleja el personaje activo en la URL sin recargar
        history.replaceState({ route: 'chat', params: { character: tab.dataset.tab } }, '', `/chat?character=${tab.dataset.tab}`);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendMessage(text);
  });

  function lockUI() {
  input.disabled = true;
  sendBtn.disabled = true;
}

function unlockUI() {
  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // auto-resize del textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Init
  applyPalette(activeId);
  renderLog(activeId);
  input.focus();
}