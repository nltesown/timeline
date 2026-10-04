---
title: Svelte 5 runes
scope: Use Svelte 5 runes safely with SSR, props, derived values, and browser-only effects.
related_files:
  - src/routes/**/*.svelte
  - src/lib/components/**/*.svelte
  - src/lib/**/*.svelte.ts
read_when: Adding or migrating reactive state, props, derived values, or effects.
---

# Svelte 5 runes

Use Svelte 5 runes for new reactive code. Verify version-sensitive behavior against the [official Svelte documentation](https://svelte.dev/docs/svelte/overview).

## State and derived values

`$state` works in components rendered on the server as well as in the browser; it does not require initialization from server data.

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{doubled}</button>
```

Use `$derived.by()` for a computed value that needs a block. Keep state local when it only controls the UI; extract complex business behavior or reusable state to testable modules, using `.svelte.ts` when it needs runes.

## Effects and browser-only APIs

`$effect` runs in the browser after the component mounts, not during server-side rendering. Use it for side effects, not for values that should instead be `$derived`.

```svelte
<script>
  import { browser } from "$app/environment";

  let count = $state(0);

  // Persist browser state without accessing localStorage during SSR.
  $effect(() => {
    if (browser) localStorage.setItem("count", String(count));
  });
</script>
```

Guard browser-only APIs such as `localStorage`, `window`, and `document`; do not access them during module initialization or server rendering.

## Props

Receive component inputs with `$props()`. Treat props as inputs and do not mutate incoming objects. Make an intentional local copy when local mutation is required, or use `$bindable()` only when the component API genuinely requires two-way binding.

```svelte
<script>
  let { user } = $props();
  let local_user = $state({ ...user });
</script>
```

Initializing `$state` from a prop creates local state; it does not automatically synchronize that state with future prop changes. Use the prop directly or an appropriate derived value when the value should remain responsive to changing inputs.

## Svelte 5 syntax

- Use `$state`, `$derived`/`$derived.by`, `$effect`, and `$props` instead of adding Svelte 4 reactive declarations or component props.
- Use event properties such as `onclick`, not legacy `on:click` directives.
- Use snippets and `{@render ...}` rather than adding legacy `<slot>` markup.
- Keep existing legacy code when migration is outside the task and changing it would add risk.
- Add a short comment explaining the purpose of a non-trivial `$effect`.
