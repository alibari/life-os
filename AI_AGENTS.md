# AI Agent Instructions for Life OS

**Current Version:** V2.1
**Primary Branch:** `main`
**Tech Stack:** React, Vite, Tailwind CSS, Shadcn UI, Supabase, Framer Motion.

## 🧠 Project Architecture
*   **Design System:** Glassmorphism (`bg-card/60 backdrop-blur-xl`). Strict `p-6` padding on all page containers.
*   **Routing:** `App.tsx` handles protected routes. All pages live in `src/pages/`.
*   **Widgets:** The core UI uses `WidgetCanvas` (`react-grid-layout`).
*   **Boot Sequence:** `SystemBoot.tsx` handles the initial load animation.

## ⚡ Development Workflow
1.  **Start Server:** `npm run dev -- --host` (Running on port 8080).
2.  **Dependencies:** Always check `package.json` before importing new libraries.
    *   *Critical:* `framer-motion` is required for animations.

## 🐙 Git Workflow (Crucial)
Future Agents must follow this EXACT sequence to ensure reliable pushes.

### 1. Verification Before Push
*   Check for untracked files: `git status`
*   Ensure secrets are ignored: `.env` must be in `.gitignore`.

### 2. Staging & Committing
```bash
git add .
git commit -m "Your descriptive message"
```

### 3. Pushing to GitHub
**Do not assume the push worked instantly.**
```bash
git push origin main
```
*   **Wait:** Allow 10-20 seconds for the network operation.
*   **Verify:** Run `git log -1 origin/main` to confirm your commit hash exists on the remote.
*   **Retry:** If the push hangs or is cancelled, retry *once* with a longer timeout.

## ⚠️ Common Pitfalls to Avoid
1.  **Missing Imports:** When modifying `App.tsx`, do not strictly replace content without preserving existing imports (Router, Auth, Pages).
2.  **Layout Misalignment:** All pages must use the container class:
    `min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center`
3.  **Lovable References:** Do not re-introduce "Lovable" branding. This is a custom "Life OS" build.

## 🔒 Security Protocol
*   NEVER commit `.env` files.
*   Use `.env.example` for templates.
*   If `.env` is accidentally committed:
    1.  `git rm --cached .env`
    2.  `echo ".env" >> .gitignore`
    3.  Commit immediately.
