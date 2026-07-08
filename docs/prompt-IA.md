Contexto: Estás trabajando en CharChat, una SPA de chat conversacional con personajes (Messi, Djokovic, Shrek, Mike Wazowski) potenciada por Google Gemini. El proyecto tiene frontend vanilla (HTML/CSS/JS con router propio), API serverless en Vercel.
Necesito que me ayudes a correrlo con vercel dev en local host porque no me carga la vista de notFound. Lee la estructura del proyecto para que tengas noción de las direcciones de cada archivo.

Resumen de la respuesta de la IA: 
-Scripts de package.json — Se actualizaron: "dev": "npx serve src -s -l 3000" (para frontend estático con SPA fallback), "dev:api": "vercel dev" (para API local), "test": "vitest run" y "test:watch": "vitest".
-vercel.json — Se revirtió a la configuración original con "outputDirectory": "src" y rewrites que redirigen todo a /index.html menos /api/*.

Contexto: Estás trabajando en CharChat, una SPA de chat conversacional con personajes (Messi, Djokovic, Shrek, Mike Wazowski) potenciada por Google Gemini. El proyecto tiene frontend vanilla (HTML/CSS/JS con router propio), API serverless en Vercel.
Tengo un error al copiar un mensaje cuando estoy en modo oscuro, no se llega a leer lo que dice el cartel del mensaje copiado.

Resumen de la respuesta de la IA:
-CSS color-scheme — Se agregó color-scheme: light y color-scheme: dark en el theme para evitar que el navegador aplique estilos oscuros por defecto al copiar texto en modo claro.
