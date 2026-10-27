<!-- BRIEF: COMMIT=341a4ea1 HASH=d6116fc4 DATE=2026-10-27T10:14:50.632Z -->
# Project Brief: web
- **Commit**: `341a4ea1` | **Updated**: 2026-10-27T10:14:50.632Z | **Files Tracked**: 69

## Overview
App Store by Agrigence Premier macOS utilities, Dynamic Island enhancements, and autonomous developer tools.

## Tech Stack
- Node.js / JavaScript/TypeScript (name: webstore)

## Project Map (Directory Tree)
```text
.
├── .agent/ (6 files)
├── assets/ (14 files)
│   ├── agent-guard/ (6 files)
│   ├── agrigence/ (6 files)
│   └── dynamo/ (2 files)
├── css/ (4 files)
├── fonts/ (7 files)
├── js/ (4 files)
├── public/ (24 files)
│   ├── agent-guard/ (6 files)
│   ├── agrigence/ (6 files)
│   ├── dynamo/ (2 files)
│   └── fonts/ (7 files)
├── LICENSE
├── README.md
├── agent-guard.html
├── apple-touch-icon.png
├── dynamo.html
├── favicon.ico
├── index.html
├── og-image-v2.png
├── package.json
└── server.js
```

## Architecture Chart
```mermaid
graph TD
  App["Application Root"]
  App --> Modules["Project Modules"]
```

## Likely Entry Points
- `index.html`
- `server.js`

## Key Commands
- `npm run start`: `node server.js`
- `npm run dev`: `node server.js`
- `npm run test`: `node -e "const http = require('http'); const req = http.get('http://localhost:3000', res => { console.log('HTTP Status:', res.statusCode); process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', err => { console.error(err); process.exit(1); });"`
