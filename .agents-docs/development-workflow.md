---
title: Development workflow
scope: Select validation commands and review code changes before finishing a task.
read_when: Implementing or validating a code change.
---

# Development workflow

## Checks

Run the narrowest relevant check for the change. Common project checks are:

- `npm run check` — synchronize SvelteKit types and run `svelte-check`.
- `npm run lint` — check Prettier formatting and run ESLint.
- `npm run build` — build the application when a change affects production compilation.

Run checks that cover the changed behavior; do not run unrelated checks by default.

## Review

- Inspect the diff for accidental route, CSS, or server-boundary changes.
- For server/API changes, verify that credentials and private data cannot reach client bundles.
- For user-facing flows, check the relevant loading, empty, error, authentication, and mutation states.
- Report the files changed and the checks run.
