---
title: SvelteKit routing
scope: Organize file-based routes, layouts, route groups, dynamic parameters, and error boundaries.
related_files:
  - src/routes/**/+page.svelte
  - src/routes/**/+layout.svelte
  - src/routes/**/+error.svelte
read_when: Adding routes, layouts, dynamic segments, route groups, or route-level errors.
---

# SvelteKit 2 — Routing Patterns

Docs: https://svelte.dev/docs/kit/introduction

---

## Route File Conventions

| File                | Purpose                          |
| ------------------- | -------------------------------- |
| `+page.svelte`      | Page component                   |
| `+page.ts`          | Universal load (server + client) |
| `+page.server.ts`   | Server-only load / form actions  |
| `+layout.svelte`    | Shared layout wrapper            |
| `+layout.ts`        | Universal layout load            |
| `+layout.server.ts` | Server-only layout load          |
| `+error.svelte`     | Error boundary page              |
| `+server.ts`        | API endpoint (GET, POST, etc.)   |

---

## Layouts with Snippets (Svelte 5)

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
</nav>

<main>
	{@render children()}
</main>
```

---

## Dynamic Routes

```
[slug]/+page.svelte          → /blog/hello-world
[category]/[product]/+page.svelte → /electronics/laptop
[[page]]/+page.svelte        → /blog  or  /blog/2  (optional)
[...path]/+page.svelte       → /docs/guide/intro  (rest params)
```

```ts
// +page.server.ts
export async function load({ params }) {
	const post = await db.post.findUnique({ where: { slug: params.slug } });
	return { post };
}
```

---

## Route Groups (Don't Affect URL)

```
(app)/dashboard/+page.svelte   → /dashboard
(marketing)/about/+page.svelte → /about
```

Use route groups to share layouts or load functions without changing the URL structure.

---

## Error Handling

```svelte
<!-- +error.svelte -->
<script>
	import { page } from '$app/state';
</script>

<h1>{page.status}</h1>
<p>{page.error?.message}</p>
<a href="/">Go home</a>
```

```ts
// +page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const product = await db.product.findUnique({ where: { id: params.id } });

	if (!product) {
		throw error(404, 'Product not found');
	}

	return { product };
}
```

---

## Checklist

- [ ] Use file-based routing (no manual router config)
- [ ] Use layouts for shared UI and shared load data
- [ ] Use route groups `(name)/` for structural organization
- [ ] Add a route-specific `+error.svelte` when the route needs tailored error handling
