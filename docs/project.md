# Project Overview

OpenBSD Web Desktop is a browser-based desktop environment inspired by the OpenBSD operating system's utilitarian aesthetic and the classic CDE/fvwm/cwm window managers. Built entirely client-side with Next.js 16 App Router, TypeScript (strict mode), Tailwind CSS v4, shadcn/ui primitives, and Lucide icons, the project delivers a functional windowed desktop with a terminal emulator, file manager, text editor, and system monitor — all running in the browser with zero backend dependencies, no database, and no external API calls.

## Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Framework      | Next.js 16 (App Router)     |
| Language       | TypeScript (strict)         |
| Styling        | Tailwind CSS v4             |
| UI Primitives  | shadcn/ui (base-nova style) |
| Icons          | Lucide React                |
| Fonts          | Geist Sans, Geist Mono      |
| Runtime        | React 19                    |

## Constraints

- **Minimal dependencies** — only shadcn/ui primitives, no additional UI frameworks or state libraries.
- **No backend** — the entire application runs client-side in the browser.
- **No persistence** — the virtual filesystem and all state live in memory and reset on reload.
- **No external API calls** — all data is generated or simulated locally.
- **No rounded corners on windows** — sharp, precise, functional chrome.
