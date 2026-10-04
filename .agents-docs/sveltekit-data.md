---
title: SvelteKit data loading
scope: Choose load boundaries and implement server, universal, parallel, streamed, and invalidated data loading.
related_files:
  - src/routes/**/+page.server.ts
  - src/routes/**/+page.ts
  - src/routes/**/+layout.server.ts
read_when: Loading route data, fetching APIs, streaming results, or invalidating loads.
---

# SvelteKit 2 — Data Loading

Docs: https://svelte.dev/docs/kit/load

---

## Server Load (`+page.server.ts`)

Runs only on the server. Has access to the database, private env vars, and `locals`.

```ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  const product = await db.product.findUnique({ where: { id: params.id } });
  return { user, product };
};
```

---

## Universal Load (`+page.ts`)

Runs on both server and client. Use SvelteKit's `fetch` (not native `fetch`).

```ts
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  // ✅ Use SvelteKit's fetch — not the global fetch
  const response = await fetch(`/api/products/${params.id}`);
  return { product: await response.json() };
};
```

---

## Hydrating Server Data into Rune State

```svelte
<script>
  let { data } = $props();

  let items = $state(data.items);
  let filter = $state("all");

  let filtered_items = $derived(
    filter === "all" ? items : items.filter((item) => item.status === filter)
  );
</script>
```

---

## Parallel Fetching

```ts
// ❌ WRONG — sequential, slow
export async function load() {
  const user = await fetch_user();
  const posts = await fetch_posts(); // waits for user
  return { user, posts };
}

// ✅ RIGHT — parallel
export async function load() {
  const [user, posts] = await Promise.all([fetch_user(), fetch_posts()]);
  return { user, posts };
}
```

---

## Streaming Slow Data

Return a Promise instead of awaiting it to stream data after initial render.

```ts
// +page.server.ts
export async function load() {
  return {
    user: await fetch_user(), // Blocks SSR — needed for initial render
    analytics: fetch_analytics(), // Streams — Promise, not awaited
  };
}
```

```svelte
<script>
  let { data } = $props();
</script>

<h1>Welcome, {data.user.name}</h1>

{#await data.analytics}
  <p>Loading analytics...</p>
{:then analytics}
  <Analytics {analytics} />
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

---

## Invalidation

```svelte
<script>
  import { invalidate, invalidateAll } from "$app/navigation";

  async function refresh() {
    await invalidate("/api/posts"); // re-runs load functions that depend on this URL
    // or
    await invalidateAll(); // re-runs all load functions
  }
</script>
```

---

## Checklist

- [ ] Use `+page.server.ts` for DB access and private env vars
- [ ] Use `+page.ts` for public API calls (runs on server + client)
- [ ] Always use SvelteKit's injected `fetch`, not the global one
- [ ] Fetch independent resources in parallel with `Promise.all`
- [ ] Stream slow, non-critical data by returning unresolved Promises
