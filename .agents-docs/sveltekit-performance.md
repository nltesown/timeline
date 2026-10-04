---
title: SvelteKit performance and project structure
scope: Apply lazy loading, prerendering, cache headers, and the repository's structural conventions.
related_files:
  - src/routes/**/+page.ts
  - src/routes/**/+page.server.ts
  - src/lib/**
read_when: Optimizing route loading, caching data, prerendering, or placing new modules.
---

# SvelteKit 2 — Performance & Project Structure

---

## Lazy-Load Heavy Components

```svelte
<script>
	let show_heavy = $state(false);
	let HeavyComponent = $state(null);

	async function load_component() {
		const module = await import('./Heavy.svelte');
		HeavyComponent = module.default;
	}

	$effect(() => {
		if (show_heavy && !HeavyComponent) load_component();
	});
</script>

{#if show_heavy && HeavyComponent}
	<HeavyComponent />
{/if}
```

---

## Prerender Static Pages

```ts
// +page.ts
export const prerender = true;
```

---

## Cache Control

```ts
// +page.server.ts
export async function load({ setHeaders }) {
	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return { data };
}
```

Set public caching only for data that is safe to share publicly. Do not apply public cache headers to authenticated or user-specific responses.

---

## Project Structure

```
src/
├── app.d.ts
├── app.html
├── hooks.server.ts
├── lib/
│   ├── components/
│   │   ├── icons/
│   │   └── ui/
│   ├── css/
│   ├── fetch/
│   ├── js/
│   ├── server/
│   ├── stores/
│   ├── types/
│   ├── validation/
│   ├── config.ts
│   └── index.ts
└── routes/
    ├── (main)/
    │   ├── billetterie/
    │   └── editor/
    │       └── api/
    ├── divers/
    └── login/
```

This is a snapshot of the current structure, not a template to copy literally. Route handlers (`+server.ts`) are nested under feature routes (currently in `routes/(main)/billetterie` and `routes/(main)/editor/api`), rather than collected in a top-level `routes/api`. Private API code belongs in `src/lib/server`, shared API helpers live in `src/lib/fetch`, and validation uses Valibot.
