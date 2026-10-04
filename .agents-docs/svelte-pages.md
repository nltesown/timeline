---
title: Svelte pages and layouts
scope: Separate presentation, UI state, business logic, and reusable state in Svelte components.
related_files:
	- src/routes/**/+page.svelte
	- src/routes/**/+layout.svelte
	- src/lib/components/**/*.svelte
read_when: Designing or refactoring page, layout, or component responsibilities.
---

# Svelte layouts and pages architecture & logic Separation

## 1. Component Responsibility

### Presentation First

`+page.svelte` and `+layout.svelte` files should primarily handle:

- Rendering and composition
- User interaction
- UI-specific state
- Styling and layout concerns

### Keep Business Logic Out of Components

Avoid embedding the following directly in pages or layouts:

- Multi-step data transformations
- Validation pipelines
- Domain/business rules
- API orchestration
- Complex state transitions
- Analytical calculations

Simple UI logic and presentation-specific derived values are acceptable.

### Keep Simple UI State Local

State that exists purely to drive the interface should remain inside components when practical:

- Modal visibility
- Dropdown state
- Active tabs
- Hover/focus state
- Simple form UI state

Do not extract state solely for the sake of extraction.

---

## 2. Extraction to Helpers & Modules

### Extract Complex Logic

Move business rules, analytical calculations, data transformations, and reusable state logic into dedicated modules.

Use:

- `*.ts` for stateless helpers and domain logic
- `*.svelte.ts` for stateful logic using Svelte 5 runes

### Route-Specific Logic

If logic is only used by a single route, colocate it within that route's directory.

Examples:

- `_helpers.ts`
- `_state.svelte.ts`
- `_transform.ts`

Prefix helper files with an underscore to prevent SvelteKit from treating them as routes.

### Shared Logic

Logic used across multiple features should live in `$lib`.

---

## 3. State Management (Svelte 5 Runes)

### Encapsulate Complex State

When state represents business behavior rather than simple UI interaction, encapsulate it in dedicated factory functions within `.svelte.ts` files.

Use Svelte 5 universal runes:

- `$state`
- `$derived`
- `$effect`

### Expose Intentional APIs

Expose a clear public interface:

- Methods for actions
- Derived values for computed state
- Read-only access where appropriate

Avoid exposing implementation details or mutation mechanisms directly.

### Prefer Factories Over Classes

Encapsulate stateful logic using factory functions rather than classes unless there is a compelling reason otherwise.

---

## 4. Business Logic vs. View Logic

A useful distinction:

### Business / Domain Logic

Usually belongs outside components.

Examples:

- Validation rules
- Permission checks
- Workflow transitions
- Data normalization
- Complex filtering and transformation pipelines

### View Logic

May remain inside components.

Examples:

- Formatting for display
- UI-only sorting
- Simple derived values used exclusively for rendering
- Conditional presentation concerns

---

## 5. Testability

Business logic should be structured so it can be tested independently of Svelte components.

### Rule of Thumb

If a piece of logic can reasonably be unit-tested without rendering a component, it probably belongs outside the component.
