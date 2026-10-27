(function () {
  var API =
    "https://api.github.com/repos/jithin-sabu/purge-app/releases/latest";
  var FALLBACK =
    "https://github.com/jithin-sabu/purge-app/releases/latest";

  function parse(data) {
    if (!data) return null;
    var version = String(data.tag_name || "").replace(/^v/i, "") || null;
    var assets = data.assets || [];
    for (var i = 0; i < assets.length; i++) {
      var name = (assets[i].name || "").toLowerCase();
      if (name.slice(-4) === ".dmg" && assets[i].browser_download_url) {
        return { version: version, dmgUrl: assets[i].browser_download_url };
      }
    }
    return null;
  }

  function apply(release) {
    if (!release || !release.dmgUrl) return;
    var hero = document.getElementById("hero-download");
    var nav = document.getElementById("nav-download");
    var heroVersion = document.getElementById("hero-version");
    var heroVersionDot = document.getElementById("hero-version-dot");
    var guide = document.getElementById("guide-download");
    if (hero) hero.setAttribute("href", release.dmgUrl);
    if (nav) nav.setAttribute("href", release.dmgUrl);
    if (guide) guide.setAttribute("href", release.dmgUrl);
    if (release.version && heroVersion) {
      heroVersion.textContent = "v" + release.version;
      heroVersion.hidden = false;
      if (heroVersionDot) heroVersionDot.hidden = false;
    }
  }

  function trackDownload(el) {
    var loc = el.dataset.gaLocation;
    if (!loc) {
      if (el.id === "hero-download") loc = "hero";
      else if (el.id === "nav-download") loc = "nav";
      else if (el.id === "guide-download") loc = "guide";
      else loc = "unknown";
    }
    var url = el.getAttribute("href") || "";
    if (typeof purgeTrack === "function") {
      purgeTrack("download_click", {
        link_url: url,
        location: loc,
        method: "dmg",
      });
    }
  }

  function onDownloadClick(e) {
    trackDownload(e.currentTarget);

    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    var release = window.__purgeLatestRelease;
    if (release && release.dmgUrl) {
      window.location.href = release.dmgUrl;
      return;
    }
    window.__purgeLatestReleasePromise.then(function (resolved) {
      window.location.href =
        (resolved && resolved.dmgUrl) || FALLBACK;
    });
  }

  function bind() {
    var ids = ["hero-download", "nav-download", "guide-download"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && !el.getAttribute("data-purge-bound")) {
        el.setAttribute("data-purge-bound", "1");
        el.addEventListener("click", onDownloadClick);
      }
    }
    apply(window.__purgeLatestRelease);
  }

  window.__purgeLatestRelease = window.__purgeLatestRelease || null;
  window.__purgeLatestReleasePromise = fetch(API, { cache: "no-store" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      var release = parse(data);
      window.__purgeLatestRelease = release;
      apply(release);
      return release;
    })
    .catch(function () {
      window.__purgeLatestRelease = null;
      return null;
    });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.addEventListener("load", function () {
    apply(window.__purgeLatestRelease);
  });
})();
