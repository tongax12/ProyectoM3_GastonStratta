/**
 * main.js
 * Punto de entrada de la aplicación (único <script> referenciado desde
 * index.html).
 */
import { router } from "./router.js";
import { setupLinkInterception } from "./navigation.js";

window.addEventListener("popstate", router);
setupLinkInterception();
router();