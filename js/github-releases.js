/**
 * GitHub Releases Dynamic Linker & 1-Click Direct Downloader
 * Connects web CTA buttons to latest GitHub assets with instantaneous fallback
 */

(function () {
  const CONFIG = {
    dynamo: {
      repo: 'anksarvesh-lgtm/dynamo-mac',
      fallbackVersion: '2.1.9',
      fallbackDmg: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/download/v2.1.9/LiquidDynamo-2.1.9.dmg',
      releasesUrl: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/latest'
    },
    guard: {
      repo: 'anksarvesh-lgtm/agent-guard',
      fallbackVersion: '0.2.18',
      fallbackInstall: 'curl -fsSL https://raw.githubusercontent.com/anksarvesh-lgtm/agent-guard/main/install.sh | bash',
      releasesUrl: 'https://github.com/anksarvesh-lgtm/agent-guard/releases/latest'
    }
  };

  async function resolveRelease(productKey) {
    const conf = CONFIG[productKey];
    if (!conf) return null;

    try {
      const res = await fetch(`https://api.github.com/repos/${conf.repo}/releases/latest`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      const version = String(data.tag_name || '').replace(/^v/i, '') || conf.fallbackVersion;
      
      let downloadUrl = conf.fallbackDmg || conf.releasesUrl;
      if (data.assets && data.assets.length > 0) {
        const dmgAsset = data.assets.find(a => a.name.toLowerCase().endsWith('.dmg'));
        if (dmgAsset && dmgAsset.browser_download_url) {
          downloadUrl = dmgAsset.browser_download_url;
        } else if (data.assets[0].browser_download_url) {
          downloadUrl = data.assets[0].browser_download_url;
        }
      }

      return {
        version,
        downloadUrl,
        publishedAt: data.published_at ? new Date(data.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        body: data.body || null
      };
    } catch (e) {
      // Instant graceful fallback
      return {
        version: conf.fallbackVersion,
        downloadUrl: conf.fallbackDmg || conf.releasesUrl,
        publishedAt: 'Latest Release',
        body: null
      };
    }
  }

  function applyToDOM(productKey, release) {
    if (!release) return;

    // Update download buttons
    const downloadBtns = document.querySelectorAll(`[data-gh-download="${productKey}"]`);
    downloadBtns.forEach(btn => {
      btn.setAttribute('href', release.downloadUrl);
      btn.setAttribute('download', '');
    });

    // Update version labels
    const versionLabels = document.querySelectorAll(`[data-gh-version="${productKey}"]`);
    versionLabels.forEach(el => {
      el.textContent = `v${release.version}`;
      el.removeAttribute('hidden');
    });

    // Update release date labels
    if (release.publishedAt) {
      const dateLabels = document.querySelectorAll(`[data-gh-date="${productKey}"]`);
      dateLabels.forEach(el => {
        el.textContent = release.publishedAt;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Instantly apply known release info for zero layout shift
    applyToDOM('dynamo', {
      version: CONFIG.dynamo.fallbackVersion,
      downloadUrl: CONFIG.dynamo.fallbackDmg,
      publishedAt: 'October 2026'
    });

    applyToDOM('guard', {
      version: CONFIG.guard.fallbackVersion,
      downloadUrl: CONFIG.guard.releasesUrl,
      publishedAt: 'October 2026'
    });

    // 2. Query GitHub in background for real-time updates
    const [dynamoRel, guardRel] = await Promise.all([
      resolveRelease('dynamo'),
      resolveRelease('guard')
    ]);

    if (dynamoRel) applyToDOM('dynamo', dynamoRel);
    if (guardRel) applyToDOM('guard', guardRel);
  });
})();
