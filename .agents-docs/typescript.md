---
title: TypeScript conventions
scope: Name and structure TypeScript values and shared domain types consistently.
read_when: Writing TypeScript or changing form/domain data boundaries.
---

# TypeScript conventions

- Use `snake_case` for local variables and functions, matching the existing codebase.
- Use PascalCase for TypeScript types/interfaces and Svelte component names.
- Centralize shared custom types in `$lib/types` rather than redefining them in route components.
- Keep domain values numeric when appropriate; coerce form strings at the boundary instead of maintaining duplicate state.
- Avoid unnecessary type assertions; prefer proper types and guards.
