# Technical Plan for Deducto PWA Conversion and Backend Communication

The plan is broken down into sequential tasks, each designed to be implemented in a separate branch with explicit commit, push, and approval steps.

**Task 1: Implement Web App Manifest for Deducto**

- Create a new branch (e.g., `feature/deducto-pwa-manifest`).
- Create or update `Deducto/public/manifest.json` with basic PWA metadata (name, short_name, start_url, display, icons).
- Commit changes with a message like "feat: Add basic PWA manifest".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 2: Implement Minimal Service Worker for Deducto**

- Create a new branch (e.g., `feature/deducto-service-worker`).
- Create `Deducto/public/service-worker.js` with a minimal implementation for basic caching (e.g., caching the index.html and manifest).
- Commit changes with a message like "feat: Add minimal service worker for caching".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 3: Update Deducto HTML for PWA Integration**

- Create a new branch (e.g., `feature/deducto-html-pwa`).
- Modify `Deducto/index.html` to link the `manifest.json` and register the `service-worker.js`.
- Commit changes with a message like "feat: Link manifest and register service worker in index.html".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 4: Implement Message Listener in Deducto**

- Create a new branch (e.g., `feature/deducto-message-listener`).
- Add an event listener in Deducto's main application file (likely `Deducto/src/main.tsx` or a dedicated communication module) to listen for `message` events, including origin verification.
- Commit changes with a message like "feat: Add message listener with origin verification".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 5: Implement Backup Command Handler in Deducto**

- Create a new branch (e.g., `feature/deducto-backup-handler`).
- Add logic within the message listener or a separate handler function to specifically process a "Backup" command. Implement basic backup logic (e.g., logging a message or simulating data export).
- Commit changes with a message like "feat: Implement backup command handler".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 6: Implement Response Mechanism in Deducto**

- Create a new branch (e.g., `feature/deducto-response-mechanism`).
- After processing the "Backup" command, send a confirmation message back to the originating window/frame.
- Commit changes with a message like "feat: Add response mechanism for commands".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.

**Task 7: Implement Dashboard Command Sending (Backend)**

- Create a new branch (e.g., `feature/backend-deducto-control`).
- **Note:** The path 'App/DelacasaBackend)' was not found. This task assumes the location of the backend application is identified.
- In the backend application, implement logic to:
  - Obtain a reference to the Deducto window/iframe.
  - Create and send the "Backup" command message to the Deducto window.
  - Listen for and handle the confirmation response from Deducto.
- Commit changes with a message like "feat: Implement basic Deducto backup command sending from backend".
- Push the branch.
- Update `PWA/docs/plans/deducto_pwa_plan.md` to mark this task as done.
- Ask for approval to proceed.
