/**
 * Dark / light switch (src/lib/theme.ts): every rule of the dark 3D zone (src/app/dark-zone*.css) applies only while <html data-theme>
 * is not "light". The prefix is wrapped in :where(), so each rule keeps exactly the specificity it had.
 */
const DARK_ONLY = ':where(html:not([data-theme="light"]))';
const plugin = () => ({
  postcssPlugin: "pna-dark-zone-only",
  Once(root) {
    const file = (root.source && root.source.input && root.source.input.file) || "";
    if (!/dark-zone[^/\\]*\.css$/.test(file)) return;
    root.walkRules((rule) => {
      if (rule.parent && rule.parent.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
      rule.selectors = rule.selectors.map((s) => (s.startsWith(DARK_ONLY) ? s : `${DARK_ONLY} ${s.trim()}`));
    });
  },
});
plugin.postcss = true;
plugin.DARK_ONLY = DARK_ONLY;
module.exports = plugin;
