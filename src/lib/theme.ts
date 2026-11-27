/**
 * Dark / light look of the site, chosen by the visitor (the switch in the header and the mobile menu).
 *
 * Everything happens in the browser: the choice is kept in localStorage and written to <html data-theme="..."> before the first paint
 * (THEME_INIT_SCRIPT in layout.tsx), so pages stay prebuilt and cached and the Worker does no extra work. Dark is the default.
 * The dark 3D zone (dark-zone*.css) applies only while the theme is not "light" (the PostCSS step in postcss.config.js scopes it);
 * light-zone.css gives the same raised 3D cards and keycap buttons in light colours.
 */
export type Theme = "dark" | "light";

export const THEME_KEY = "pna-theme-v1";
export const THEME_EVENT = "pna-theme-change";

/** Runs before first paint. Anything but a saved "light" means dark. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark",d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t}catch(e){}})();`;

export function currentTheme(): Theme {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this page */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}
