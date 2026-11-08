# Installation & Setup Guide

This guide walks through configuring the local development environment, installing dependencies, and compiling the project.

---

## 1. Prerequisites

* **Bun**: `^1.1.0` or higher (Primary package manager and test runner). Install via:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
* **Node.js** (Optional fallback): `^20.0.0` or higher.
* **Operating System**: macOS (ARM64/x64), Linux (x64), or Windows via WSL2.

---

## 2. Cloning & Installing

Clone the repository and install dependencies using Bun's native lockfile:

```bash
# Clone the repository
git clone https://github.com/AtulPahal/web-openbsd.git
cd web-openbsd

# Checkout development branch (recommended for contributions)
git checkout dev

# Install dependencies
bun install
```

---

## 3. Running the Development Server

Start Next.js with Turbopack for instant Fast Refresh:

```bash
bun run dev
```

The application will be available at:
* **Local URL**: [http://localhost:3000](http://localhost:3000)
* **Login Password**: `2026`

To run on a custom port:
```bash
bun run dev -- --port 3001
```

---

## 4. Compilation & Quality Checks

Always verify that TypeScript types, lint rules, and production builds compile cleanly before submitting pull requests:

```bash
# TypeScript strict check (0 errors)
bun run typecheck

# ESLint inspection (0 errors, 0 warnings)
bun run lint

# Next.js Turbopack production build
bun run build
```

---

## 5. Deployment

The project is structured as a standard Next.js application that can be deployed to Vercel, Cloudflare Pages, Netlify, or self-hosted via Docker:

```bash
# Start production server
bun run start
```
