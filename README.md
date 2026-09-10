# My Writing App

An offline-first personal journal and long-form writing PWA. It includes no AI, tracking, custom passwords, or backend. Writing is saved immediately in browser IndexedDB and, when the user signs in, to that user’s Google Drive.

## Features

- Journal entries have immutable creation timestamps, multiple entries per day, a timeline, and offline search.
- Books contain reorderable chapters and sections; sections can be split or merged.
- Tiptap rich-text editing supports headings, emphasis, lists, quotes, links, alignment, undo/redo, and images.
- Autosave and local version snapshots; restoration always creates a new snapshot, preserving every later revision.
- Google Drive sync, conflict preservation as a separate copy, dark mode, responsive UI, TXT/DOCX/PDF exports, and installable PWA support.

## Architecture

GitHub Pages is a static host: it cannot keep OAuth secrets, run a database, or execute background sync. This app uses Google Identity Services in the browser with a **public OAuth web client** and the minimal `drive.file` scope. Google Drive is the cloud store; IndexedDB is the durable offline working store. The client ID is public by design—never add a client secret.

Data is kept below `My Writing App/` in `Journal`, `Stories`, `Attachments`, `Versions`, and `AppData`. UUIDs identify documents regardless of titles or moves. A compact `workspace.json` manifest prevents scanning all of Drive; individual files keep document contents. Sync errors never discard local changes. If a remote document changed while there are unsynced local changes, the app preserves a conflict copy rather than overwriting one version.

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Configure the public Google client ID below.
4. Run `npm install`, then `npm run dev`.

## Google OAuth and Drive setup

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable **Google Drive API**.
2. In **APIs & Services → OAuth consent screen**, set up consent (External or Workspace Internal) and add yourself as a test user while testing.
3. Create **Credentials → OAuth client ID → Web application**.
4. Add `http://localhost:5173` to Authorized JavaScript origins. Add `https://YOUR-USER.github.io` for GitHub Pages—the origin does not include the repository name.
5. Set `VITE_GOOGLE_CLIENT_ID` in `.env.local` to the generated client ID. No Google password is stored or handled by this app.

## Deploy to GitHub Pages

1. Change `base` in `vite.config.ts` from `/my-writing-app/` to `/<your-repository-name>/`.
2. Push the project to `main`.
3. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
4. In repository **Settings → Secrets and variables → Actions**, add `VITE_GOOGLE_CLIENT_ID` as a repository variable.
5. The included workflow builds and deploys automatically. Add the actual Pages origin to the Google OAuth client before login.

Visit the site once online, then use the browser’s **Install app** / **Add to Home Screen** option. The service worker caches the application shell for offline opening. A fully closed PWA cannot perform a background Drive sync on static hosting; it safely syncs next time the app is open and online.

## Verification

Run `npm run build` for type checking and a production PWA build, `npm run lint` for linting, and `npm test` for test execution.
