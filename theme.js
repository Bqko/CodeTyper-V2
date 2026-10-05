/* ==========================================================
   THEME TOGGLE (shared by every page)
   Controls Dark Mode / Light Mode and remembers the choice.

   appearance.js (in the <head>) applies the saved theme before the
   page is drawn. This file runs the button.

   Skins have their own colours and replace light / dark mode, so the
   button is hidden while a skin other than "Classic" is active.
   ========================================================== */

(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Without appearance.js, apply the saved theme here.
  if (typeof applyAppearance === 'undefined' &&
      localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  // Shows the right button text, and hides the button while a skin is active.
  function updateButton() {
    toggleBtn.hidden = root.hasAttribute('data-skin');
    toggleBtn.textContent =
      root.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  updateButton();

  // Switch theme when the button is clicked.
  toggleBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';

    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateButton();
  });

  // The Customize page can change the skin while this page is open.
  document.addEventListener('appearancechange', updateButton);
})();