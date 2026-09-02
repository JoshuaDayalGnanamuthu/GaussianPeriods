(function initializeTheme() {
  const storageKey = "gaussian-periods-theme";
  const root = document.documentElement;

  function getStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
    } catch (error) {
      return "dark";
    }
  }

  function updateButtons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} mode`;
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.setAttribute("aria-pressed", String(theme === "light"));
    });
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateButtons(theme);

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
        // The theme still works when storage is unavailable.
      }
    }

    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  applyTheme(getStoredTheme(), false);

  document.addEventListener("DOMContentLoaded", () => {
    updateButtons(root.dataset.theme || "dark");

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
        applyTheme(nextTheme, true);
      });
    });
  });
})();
