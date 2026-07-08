/**
 * main.js
 * Punto de entrada de la aplicación (único <script> referenciado desde
 * index.html).
 */
import { router } from "./router.js";
import { setupLinkInterception } from "./navigation.js";
import { initTheme } from "./theme.js";

window.addEventListener("popstate", router);
setupLinkInterception();
initTheme();
router();