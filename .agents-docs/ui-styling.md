---
title: UI and styling
scope: Preserve Captiva's component, CSS, and responsive design conventions.
read_when: Changing components, styles, or interactive controls.
---

# UI and styling

- Reuse CSS files under `src/lib/css` before adding new styles; prefer shared CSS changes over duplicated component styles.
- Use Bits UI and the project's custom styles for interactive controls. Do not add a styling framework.
- Keep the desktop-oriented experience responsive and visually consistent with nearby routes.
- Avoid `:global()` in Svelte components unless a documented integration need makes it unavoidable.
