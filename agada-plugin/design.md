# Agada Admin Dashboard Design Rules

## Core Principles

- Optimize for speed of daily admin tasks (products/packages updates in under 30 seconds).
- Keep interactions consistent across screens.
- Prefer clarity over visual density.
- Maintain RTL-friendly layout and copy.

## Information Architecture

- Primary screens: `Products`, `Packages`, `Settings`.
- Each data screen uses master-detail:
  - Main area: searchable/bulk-manageable table.
  - Side panel: create/edit/details.

## Component Standards (shadcn-oriented)

- Use shadcn patterns/components where possible: `DataTable`, `Sheet`, `Dialog`, `Form`, `Tabs`, `Toast`, `Badge`, `DropdownMenu`, `Checkbox`.
- Table rows must support:
  - single row quick edit
  - multi-row selection
  - bulk action toolbar
- Side panel must include:
  - title + status
  - body form fields
  - sticky footer actions (`Cancel`, primary `Save`)

## UX Behavior Rules

- Use side panel for create/edit flows.
- Use modal dialogs only for destructive confirmations.
- Show bulk action bar only when one or more rows are selected.
- Preserve filters/search after save where possible.
- Show explicit success/error toast for every mutation.
- Warn user before discarding unsaved side-panel changes.

## Bulk Operations

- Required bulk actions: activate, deactivate, delete.
- Selection must remain stable during pagination/filtering changes (when possible).
- Deleting shows irreversible warning copy.

## Forms and Validation

- Validate on blur and on submit.
- Keep error copy near the field.
- Do not block saving for non-critical optional fields.
- For slugs:
  - lowercase
  - alphanumeric with underscores/hyphens only

## Accessibility

- Full keyboard support for table, side panel, and dialogs.
- Ensure visible focus states.
- Maintain sufficient color contrast.
- All icon-only actions must have accessible labels.

## Microcopy and Localization

- Use simple admin-friendly Hebrew as default.
- Keep labels short and action-focused.
- Keep system feedback concise and specific.