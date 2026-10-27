<!-- BRIEF: COMMIT=d9f0ea6f HASH=a220bc37 DATE=2026-10-27T08:56:01.137Z -->
# Project Brief: web
- **Commit**: `d9f0ea6f` | **Updated**: 2026-10-27T08:56:01.137Z | **Files Tracked**: 53

## Overview
No README.md found.

## Tech Stack
- Node.js / JavaScript/TypeScript (name: dynamo-and-agent-guard)

## Project Map (Directory Tree)
```text
.
├── .agent/ (6 files)
├── assets/ (8 files)
│   ├── agent-guard/ (6 files)
│   └── dynamo/ (2 files)
├── css/ (3 files)
├── fonts/ (7 files)
├── js/ (3 files)
├── public/ (18 files)
│   ├── agent-guard/ (6 files)
│   ├── dynamo/ (2 files)
│   └── fonts/ (7 files)
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
