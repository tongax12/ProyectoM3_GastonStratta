/**
 * characters.js
 * Catálogo de personajes: datos, paleta de colores y "personalidad" simulada.
 *
 * Cada personaje define una paleta de 5 tokens que se inyectan como
 * variables CSS en el contenedor del chat (data-character="id"):
 *   --c-primary    color principal / burbuja del personaje
 *   --c-secondary  acento secundario (links, badges)
 *   --c-bg         fondo del área de chat
 *   --c-surface    fondo de tarjetas / header del chat
 *   --c-text       color de texto sobre --c-primary
 */
const CHARACTERS = [
  {
    id: 'messi',
    name: 'Leo Messi',
    tagline: 'La Pulga. Magia con la zurda.',
    avatar: '🐐', // fallback si avatarImage no carga
    avatarImage: './img/messi.jpg',
    bio: 'Capitán de la Selección Argentina campeona del mundo, ocho veces Balón de Oro. Habla con calma, humildad y pasión por el fútbol de potrero.',
    palette: {
      primary: '#5BA8E0',   // celeste albiceleste
      secondary: '#FDB927', // dorado del Balón de Oro
      bg: '#F4F8FC',
      surface: '#FFFFFF',
      text: '#0B2B4A',
      onPrimary: '#0B2B4A'
    },
    greeting: '¡Hola! Soy Leo. Contame, ¿de qué querés hablar? ¿Fútbol, familia o algún recuerdo de la Copa del Mundo?',
    sample: [
      'La verdad, lo de Qatar fue un sueño cumplido para todo un país, no solo para mí.',
      'Siempre digo que el trabajo en equipo le gana al talento individual.',
      'Rosario está en mi corazón, ahí aprendí a jugar en la calle con mis amigos.',
      'Antes de cada partido trato de estar tranquilo, la ansiedad no suma nada.'
    ]
  },
  {
    id: 'djokovic',
    name: 'Novak Djokovic',
    tagline: 'Nole. Disciplina, elasticidad mental y récords.',
    avatar: '🎾', // fallback si avatarImage no carga
    avatarImage: './img/djokovic.jpg',
    bio: 'Tenista serbio, el mayor ganador de torneos de Grand Slam en la historia del tenis masculino. Filosófico, meticuloso y obsesionado con la mejora constante.',
    palette: {
      primary: '#C6363C',   // rojo de la bandera serbia
      secondary: '#C4D600', // verde-amarillo pelota de tenis
      bg: '#FBF7F2',
      surface: '#FFFFFF',
      text: '#FFFFFF',
      onPrimary: '#FFFFFF'
    },
    greeting: 'Zdravo! Soy Novak. Hablemos de tenis, de mentalidad o de cómo mantener la calma bajo presión.',
    sample: [
      'Cada punto es una nueva oportunidad, el pasado no define el siguiente golpe.',
      'La rutina y la disciplina diaria son más importantes que la motivación.',
      'Jugar cinco sets enseña tanto sobre la mente como sobre el cuerpo.',
      'Mi familia y Serbia son mi motor en cada torneo que juego.'
    ]
  },
  {
    id: 'shrek',
    name: 'Shrek',
    tagline: 'El ogro más querido del pantano.',
    avatar: '👹', // fallback si avatarImage no carga
    avatarImage: './img/shrek.jpg',
    bio: 'Ogro gruñón pero de buen corazón, dueño de un pantano en un reino muy, muy lejano. Sarcástico, directo y con un cariño especial por las cebollas.',
    palette: {
      primary: '#6B8E23',   // verde ogro
      secondary: '#D9A441', // mostaza fairy-tale
      bg: '#F1F4E8',
      surface: '#FFFDF5',
      text: '#23300F',
      onPrimary: '#1B2A0A'
    },
    greeting: '¡Ahh! ¿Qué hacés en mi pantano? Bueno, ya que estás acá... ¿de qué querés hablar?',
    sample: [
      'Los ogros somos como las cebollas, tenemos capas. ¿Vos no tenés capas?',
      'La gente juzga antes de conocer, por eso prefiero mi pantano tranquilo.',
      'Fiona y Burro son lo más parecido a una familia que tengo, y no los cambio por nada.',
      '¿Sabías que un pantano bien cuidado vale más que cualquier castillo?'
    ]
  },
  {
    id: 'mike',
    name: 'Mike Wazowski',
    tagline: 'El ojo más asustador (y simpático) de Monstruos S.A.',
    avatar: '👁️', // fallback si avatarImage no carga
    avatarImage: './img/mike.jpg',
    bio: 'Monstruo verde de un solo ojo, mejor amigo de Sulley y experto en sustos y en hablar sin parar. Optimista, gracioso y siempre con un chiste a mano.',
    palette: {
      primary: '#6FCB3D',   // verde Mike
      secondary: '#6B2C91', // violeta Monstruos S.A.
      bg: '#F0F7EC',
      surface: '#FFFFFF',
      text: '#102B0A',
      onPrimary: '#0E2208'
    },
    greeting: '¡Eyyy! Soy Mike Wazowski, el mejor asustador de Monstruos S.A. (después de Sulley, bueno). ¿Qué onda?',
    sample: [
      'Para asustar de verdad hay que tener buena presencia escénica, ¡y yo tengo de sobra!',
      'Sulley es mi mejor amigo, juntos somos un equipo imparable.',
      'Las risas también generan energía, ¡no solo los gritos!',
      'Un ojo bien entrenado ve más que dos ojos distraídos, créeme.'
    ]
  }
];

/** Devuelve un personaje por id, o el primero si no se encuentra. */
function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

/**
 * Devuelve el HTML a inyectar en cualquier "hueco" de avatar.
 * Si el personaje tiene avatarImage, usa la foto (con el emoji como
 * fallback visual vía onerror); si no, usa el emoji directamente.
 * Se usa en home.js, chat.js y about.js para que todos los avatares
 * (tarjetas, tabs, header del chat, burbujas, ficha "Acerca de") se
 * comporten igual sin duplicar esta lógica en cada vista.
 */
/**
 * Reintenta cargar la imagen de avatar ante un fallo transitorio (ej: el
 * servidor de desarrollo todavía no terminó de servir el archivo en la
 * primera carga en frío de la página). Si falla 2 veces, recién ahí cae
 * definitivamente al emoji.
 */
function handleAvatarError(img) {
  const attempts = parseInt(img.dataset.retry || '0', 10);
  if (attempts < 2) {
    img.dataset.retry = String(attempts + 1);
    const baseSrc = img.src.split('?')[0];
    setTimeout(() => { img.src = `${baseSrc}?r=${attempts + 1}`; }, 250);
  } else {
    img.replaceWith(Object.assign(document.createElement('span'), { textContent: img.dataset.fallback || '' }));
  }
}

function characterAvatarHTML(character) {
  if (character.avatarImage) {
    return `<img class="avatar-img" src="${character.avatarImage}" alt="${character.name}" data-fallback="${character.avatar}" />`;
  }
  return character.avatar;
}

/**
 * Engancha el manejo de error (sin atributos inline, para no chocar con
 * Content-Security-Policy) a todas las <img class="avatar-img"> nuevas
 * dentro de un contenedor. Hay que llamarla después de cualquier
 * innerHTML que inserte avatares (home.js, chat.js, about.js).
 */
function wireAvatarImages(scope) {
  (scope || document).querySelectorAll('img.avatar-img:not([data-wired])').forEach((img) => {
    img.dataset.wired = '1';
    img.addEventListener('error', () => handleAvatarError(img));
  });
}