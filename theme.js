/* ==========================================================
   THEME TOGGLE (shared by every page)
   Controls Dark Mode / Light Mode and remembers the choice.

   This file is loaded by both index.html (home) and
   practice.html, so the theme stays the same on both pages.
   ========================================================== */

(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Apply the saved theme when the page opens.
  if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = 'Light Mode';
  }

  // Switch theme when the button is clicked.
  toggleBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';

    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    toggleBtn.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  });
})();