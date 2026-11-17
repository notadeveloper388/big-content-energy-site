/* Client-side site search for /search/. Pairs with search-index.json. */
(function () {
  var INDEX_URL = "search-index.json";
  var SNIPPET_RADIUS = 90;
  var statusEl = document.getElementById("search-status");
  var resultsEl = document.getElementById("search-results");
  var inputEl = document.getElementById("search-input");
  var pages = [];
  var loaded = false;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function parseQuery(raw) {
    var q = (raw || "").trim();
    if (!q) return [];
    if (q.indexOf('"') === -1) return [q];
    var terms = [];
    var i = 0;
    while (i < q.length) {
      while (i < q.length && /\s/.test(q.charAt(i))) i++;
      if (i >= q.length) break;
      if (q.charAt(i) === '"') {
        var end = q.indexOf('"', i + 1);
        if (end === -1) {
          var rest = q.slice(i + 1).trim();
          if (rest) terms.push(rest);
          break;
        }
        var phrase = q.slice(i + 1, end).trim();
        if (phrase) terms.push(phrase);
        i = end + 1;
      } else {
        var next = q.indexOf('"', i);
        if (next === -1) next = q.length;
        q.slice(i, next).trim().split(/\s+/).forEach(function (w) {
          if (w) terms.push(w);
        });
        i = next;
      }
    }
    return terms;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function haystack(page) {
    return ((page.title || "") + " " + (page.text || "")).toLowerCase();
  }

  function matchesPage(page, terms) {
    if (!terms.length) return false;
    var hay = haystack(page);
    for (var i = 0; i < terms.length; i++) {
      if (hay.indexOf(terms[i].toLowerCase()) === -1) return false;
    }
    return true;
  }

  function highlight(text, terms) {
    if (!text) return "";
    var re = new RegExp("(" + terms.map(escapeRe).join("|") + ")", "gi");
    return escapeHtml(text).replace(re, "<mark>$1</mark>");
  }

  function snippetFor(page, terms) {
    var text = page.text || "";
    var lower = text.toLowerCase();
    var first = -1;
    var hitLen = 0;
    for (var i = 0; i < terms.length; i++) {
      var at = lower.indexOf(terms[i].toLowerCase());
      if (at !== -1 && (first === -1 || at < first)) {
        first = at;
        hitLen = terms[i].length;
      }
    }
    if (first === -1) {
      var t = (page.title || "").trim();
      return t ? highlight(t, terms) : "";
    }
    var start = Math.max(0, first - SNIPPET_RADIUS);
    var end = Math.min(text.length, first + hitLen + SNIPPET_RADIUS);
    var slice = text.slice(start, end);
    var prefix = start > 0 ? "…" : "";
    var suffix = end < text.length ? "…" : "";
    return prefix + highlight(slice, terms) + suffix;
  }

  function render(query) {
    var terms = parseQuery(query);
    resultsEl.innerHTML = "";
    if (!terms.length) {
      setStatus(loaded ? "Type to search the site." : "");
      return;
    }
    var hits = [];
    for (var i = 0; i < pages.length; i++) {
      if (matchesPage(pages[i], terms)) hits.push(pages[i]);
    }
    if (!hits.length) {
      setStatus("No pages matched “" + query.trim() + "”.");
      return;
    }
    setStatus(hits.length === 1 ? "1 page found." : hits.length + " pages found.");
    var ul = document.createElement("ul");
    ul.className = "search-hits";
    hits.forEach(function (page) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "search-hit";
      a.href = page.url;
      var h = document.createElement("h2");
      h.innerHTML = highlight(page.title || page.url, terms);
      var p = document.createElement("p");
      p.className = "search-snippet";
      p.innerHTML = snippetFor(page, terms);
      var u = document.createElement("span");
      u.className = "search-url";
      u.textContent = page.url;
      a.appendChild(h);
      a.appendChild(p);
      a.appendChild(u);
      li.appendChild(a);
      ul.appendChild(li);
    });
    resultsEl.appendChild(ul);
  }

  function queryFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    } catch (e) {
      return "";
    }
  }

  function writeUrl(q) {
    try {
      var url = new URL(window.location.href);
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      history.replaceState(null, "", url.pathname + url.search);
    } catch (e) {}
  }

  var timer = null;
  function onInput() {
    var q = inputEl.value;
    writeUrl(q);
    render(q);
  }

  inputEl.addEventListener("input", function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onInput, 40);
  });
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timer) clearTimeout(timer);
      onInput();
    }
  });

  setStatus("Loading the search index…");
  fetch(INDEX_URL, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("Index request failed: " + res.status);
      return res.json();
    })
    .then(function (data) {
      pages = (data && data.pages) || [];
      loaded = true;
      var initial = queryFromUrl();
      if (initial && !inputEl.value) inputEl.value = initial;
      if (inputEl.value) render(inputEl.value);
      else setStatus("Type to search the site.");
    })
    .catch(function () {
      setStatus("The search index could not be loaded. Try refreshing the page.");
    });
})();
