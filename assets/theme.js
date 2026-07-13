(function () {
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    var t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('bce-theme', t); } catch (e) {}
    var labels = document.querySelectorAll('.theme-toggle-label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].textContent = t === 'light' ? 'Light' : 'Dark';
    }
    var btns = document.querySelectorAll('.theme-toggle');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  // init from storage / preference
  try {
    var stored = localStorage.getItem('bce-theme');
    if (stored === 'light' || stored === 'dark') applyTheme(stored);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) applyTheme('light');
    else applyTheme('dark');
  } catch (e) {
    applyTheme('dark');
  }

  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;
})();
