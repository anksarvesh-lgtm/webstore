const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// In-Memory Real-Time Release Cache
let releaseCache = {
  dynamo: {
    version: '2.1.9',
    tag: 'v2.1.9',
    downloadUrl: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/download/v2.1.9/LiquidDynamo-2.1.9.dmg',
    releasesUrl: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/latest',
    publishedAt: 'October 2026'
  },
  guard: {
    version: '0.2.21',
    tag: 'v0.2.21',
    downloadUrl: 'https://github.com/anksarvesh-lgtm/agent-guard/releases/latest',
    installCmd: 'curl -fsSL https://raw.githubusercontent.com/anksarvesh-lgtm/agent-guard/main/install.sh | bash',
    releasesUrl: 'https://github.com/anksarvesh-lgtm/agent-guard/releases/latest',
    publishedAt: 'October 2026'
  },
  lastFetchedAt: 0,
  isFetching: false
};

function httpsGetHeader(url, headers = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
          ...headers
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => {
          if (body.length < 50000) body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    } catch (e) {
      resolve(null);
    }
  });
}

async function refreshLatestReleases() {
  if (releaseCache.isFetching) return releaseCache;
  releaseCache.isFetching = true;

  try {
    // 1. Resolve Dynamo Mac latest tag from GitHub web redirect
    const dynamoRes = await httpsGetHeader('https://github.com/anksarvesh-lgtm/dynamo-mac/releases/latest');
    if (dynamoRes && dynamoRes.headers && dynamoRes.headers.location) {
      const loc = dynamoRes.headers.location;
      const match = loc.match(/\/releases\/tag\/(v?[0-9a-zA-Z\.\-]+)/);
      if (match && match[1]) {
        const tag = match[1];
        const cleanVer = tag.replace(/^v/i, '');
        releaseCache.dynamo.tag = tag;
        releaseCache.dynamo.version = cleanVer;
        releaseCache.dynamo.downloadUrl = `https://github.com/anksarvesh-lgtm/dynamo-mac/releases/download/${tag}/LiquidDynamo-${cleanVer}.dmg`;
        releaseCache.dynamo.releasesUrl = `https://github.com/anksarvesh-lgtm/dynamo-mac/releases/tag/${tag}`;
      }
    }

    // 2. Resolve Agent Guard latest version from raw package.json
    const guardPkg = await httpsGetHeader('https://raw.githubusercontent.com/anksarvesh-lgtm/agent-guard/main/package.json');
    if (guardPkg && guardPkg.body) {
      try {
        const parsed = JSON.parse(guardPkg.body);
        if (parsed.version) {
          releaseCache.guard.version = parsed.version;
          releaseCache.guard.tag = `v${parsed.version}`;
        }
      } catch (_) {}
    }

    releaseCache.lastFetchedAt = Date.now();
  } catch (err) {
    console.error('Error refreshing releases:', err.message);
  } finally {
    releaseCache.isFetching = false;
  }

  return releaseCache;
}

// Background auto-refresh loop every 60 seconds
setInterval(refreshLatestReleases, 60 * 1000);
// Trigger initial fetch asynchronously
refreshLatestReleases().catch(() => {});

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  // =========================================================================
  // Automated Release & 1-Click Direct Download Endpoints
  // =========================================================================

  // API route: Live cached releases metadata
  if (pathname === '/api/latest-releases' || pathname === '/api/releases') {
    // If cache is older than 45s, refresh in background
    if (Date.now() - releaseCache.lastFetchedAt > 45 * 1000) {
      refreshLatestReleases().catch(() => {});
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      lastFetchedAt: releaseCache.lastFetchedAt,
      dynamo: releaseCache.dynamo,
      guard: releaseCache.guard
    }, null, 2));
    return;
  }

  // 1-Click Direct Download Redirect for LiquidDynamo (.dmg)
  if (pathname === '/download/dynamo' || pathname === '/download/dynamo.dmg' || pathname === '/download/dynamo/latest') {
    if (Date.now() - releaseCache.lastFetchedAt > 60 * 1000) {
      await refreshLatestReleases();
    }
    const targetUrl = releaseCache.dynamo.downloadUrl;
    res.writeHead(302, {
      'Location': targetUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(`Redirecting to latest LiquidDynamo DMG: ${targetUrl}`);
    return;
  }

  // 1-Click Direct Download Redirect for Agent Guard
  if (pathname === '/download/guard' || pathname === '/download/guard/latest') {
    if (Date.now() - releaseCache.lastFetchedAt > 60 * 1000) {
      await refreshLatestReleases();
    }
    const targetUrl = releaseCache.guard.downloadUrl;
    res.writeHead(302, {
      'Location': targetUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(`Redirecting to latest Agent Guard release: ${targetUrl}`);
    return;
  }

  // =========================================================================
  // Static File Serving with Clean Extensionless URLs
  // =========================================================================

  let safePath = path.normalize(decodeURI(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  let filePath = path.join(ROOT, safePath);

  // If path doesn't exist, try appending .html for clean URLs
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // If path doesn't exist, check public/ as fallback
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(ROOT, 'public', safePath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else if (fs.existsSync(publicPath + '.html')) {
      filePath = publicPath + '.html';
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Support Range requests (vital for MP4 video streaming)
  if (ext === '.mp4' && req.headers.range) {
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });
    file.pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache'
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Web Hub Server with Auto-Update Engine running at: http://localhost:${PORT}\n`);
});
