---
title: SvelteKit form actions
scope: Build progressively enhanced forms with server validation, actions, errors, and success states.
related_files:
  - src/routes/**/+page.server.ts
  - src/routes/**/*.svelte
  - src/lib/validation/**/*.ts
read_when: Adding or changing form actions, enhancement, validation, or mutation feedback.
---

# SvelteKit 2 — Form Actions

Docs: https://svelte.dev/docs/kit/form-actions

---

## Basic Form Action

```ts
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const message = data.get('message');

		if (!email || !message) {
			return fail(400, { error: 'Email and message required', email, message });
		}

		await send_email(email, message);
		return { success: true };
	}
} satisfies Actions;
```

---

## Progressive Enhancement with `enhance`

```svelte
<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
	let submitting = $state(false);

	const handle_submit = enhance(() => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			await update();
		};
	});
</script>

<form method="POST" use:handle_submit>
	<input type="email" name="email" required />
	<textarea name="message" required></textarea>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="success">Message sent!</p>
	{/if}

	<button type="submit" disabled={submitting}>
		{submitting ? 'Sending...' : 'Send'}
	</button>
</form>
```

---

## Optimistic UI

```svelte
<script>
	import { enhance } from '$app/forms';

	let { data } = $props();
	let items = $state(data.items);
	let optimistic_item = $state(null);

	const handle_add = enhance(({ formData }) => {
		const text = formData.get('text');
		optimistic_item = { id: 'temp', text, pending: true };

		return async ({ result, update }) => {
			if (result.type === 'success') {
				items = [...items, result.data.item];
			}
			optimistic_item = null;
			await update();
		};
	});
</script>

<form method="POST" action="?/add" use:handle_add>
	<input name="text" required />
	<button>Add</button>
</form>

<ul>
	{#each items as item}
		<li>{item.text}</li>
	{/each}
	{#if optimistic_item}
		<li class="opacity-50">{optimistic_item.text} (saving...)</li>
	{/if}
</ul>
```

---

## Named Actions

```ts
// +page.server.ts
export const actions = {
	create: async ({ request }) => {
		/* ... */
	},
	delete: async ({ request }) => {
		/* ... */
	}
} satisfies Actions;
```

```svelte
<form method="POST" action="?/create" use:enhance>...</form>
<form method="POST" action="?/delete" use:enhance>...</form>
```

---

## Validation with Valibot

```ts
// +page.server.ts
import * as v from 'valibot';
import { fail } from '@sveltejs/kit';

const schema = v.object({
	email: v.pipe(v.string(), v.email('Invalid email')),
	password: v.pipe(v.string(), v.minLength(8, 'Min 8 characters'))
});

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const result = v.safeParse(schema, Object.fromEntries(data));

		if (!result.success) {
			const errors = v.flatten(result.issues).nested;
			return fail(400, { errors });
		}

		// result.output is validated and typed
		return { success: true };
	}
};
```

---

## Checklist

- [ ] Forms work without JavaScript (`method="POST"`)
- [ ] Use `enhance()` for progressive enhancement
- [ ] Handle loading, error, and success states in the template
- [ ] Always validate on the server (never trust client input)
- [ ] Use `fail()` to return structured errors to the form
