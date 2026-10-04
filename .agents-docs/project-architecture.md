---
title: Project architecture and API boundaries
scope: Choose project libraries, module locations, and safe client/server boundaries.
read_when: Adding dependencies, placing shared code, or working with authentication or external APIs.
---

# Project architecture and API boundaries

## Stack

- Application framework: SvelteKit 2, Svelte 5, and TypeScript.
- UI components: Bits UI with the project's custom CSS; do not add Tailwind.
- Forms and validation: Formsnap, `sveltekit-superforms`, and Valibot. Follow the pattern already used by the route being changed.
- Authentication and sessions: better-auth.
- Deployment: `@sveltejs/adapter-vercel`.

Do not introduce alternative frameworks or libraries for these responsibilities without approval.

## Module boundaries

- Keep credentials, tokens, private environment variables, and privileged API calls in `$lib/server` or server route modules. Never expose them to browser code.
- Use `+page.server.ts` and `+layout.server.ts` for private data, authorization, server-only API calls, and form actions. Use universal load files only for data safe to load on both server and client.
- Preserve the established better-auth session and authenticated-route patterns. Client-side checks do not replace server authorization.
- Put reusable domain types in `$lib/types` and validation schemas in `$lib/validation`.
- Use SvelteKit's injected `fetch` in load functions and preserve server/client load boundaries.
- For route-specific helpers, colocate files in the route directory and prefix them with `_` (for example, `_helpers.ts` or `_state.svelte.ts`).
- Put logic shared across features in `$lib`.
