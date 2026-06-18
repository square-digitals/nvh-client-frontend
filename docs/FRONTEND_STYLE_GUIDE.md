# NVH Frontend Style Guide

This guide defines the visual and code standards for the **client-facing portal**. It is derived directly from the existing admin panel so both products share a single, coherent design language.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`) |
| Icons | [Lucide React](https://lucide.dev) |
| Fonts | Geist Sans (body) · Geist Mono (code/numbers) |
| Language | TypeScript — strict mode, no `any` |

---

## Brand Colours

All colours are defined in `globals.css` under `@theme` and are available as Tailwind utilities (`bg-brand-*`, `text-brand-*`, `border-brand-*`).

| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#f0fdf4` | Tinted backgrounds, icon containers |
| `brand-100` | `#dcfce7` | Light badges, info surfaces |
| `brand-200` | `#bbf7d0` | Hover highlights |
| `brand-300` | `#86efac` | — |
| `brand-400` | `#4ade80` | — |
| `brand-500` | `#22c55e` | Focus rings, accents |
| `brand-600` | `#16a34a` | Primary icon fills, logo background |
| `brand-700` | `#15803d` | **Primary button**, active nav items, avatar background |
| `brand-800` | `#166534` | Button hover, active sidebar |
| `brand-900` | `#14532d` | — |
| `brand-950` | `#052e16` | **Sidebar background**, dark panels |

### Neutral palette (Tailwind slate)

Use `slate` for all neutral text, borders, and surfaces. Do not use `gray` or `zinc`.

| Usage | Class |
|---|---|
| Page background | `bg-slate-50` |
| White surfaces (cards, inputs) | `bg-white` |
| Primary text | `text-slate-900` |
| Secondary text | `text-slate-600` |
| Muted/label text | `text-slate-500` |
| Placeholder / meta | `text-slate-400` |
| Borders | `border-slate-200` |
| Dividers, table rows | `border-slate-100` / `divide-slate-100` |
| Skeleton loaders | `bg-slate-100` |

### Semantic colours

These are reserved — use them **only** for their semantic meaning.

| Meaning | Background | Text | Border |
|---|---|---|---|
| Success / Active | `bg-green-50` | `text-green-700` | `border-green-200` |
| Warning / Suspended | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` |
| Danger / Overdue | `bg-red-50` | `text-red-700` | `border-red-200` |
| Info / Provisioning | `bg-blue-50` | `text-blue-700` | `border-blue-200` |
| Neutral / Terminated | `bg-slate-100` | `text-slate-500` | — |
| Amber / Security alerts | `bg-amber-50` | `text-amber-800` | `border-amber-200` |

---

## Typography

All text is set in Geist Sans. Use Geist Mono for numeric codes and monospaced content.

| Role | Classes |
|---|---|
| Page heading | `text-xl font-semibold text-slate-900` |
| Section heading | `text-base font-semibold text-slate-800` |
| Sub-heading | `text-sm font-medium text-slate-700` |
| Body | `text-sm text-slate-600` |
| Muted body | `text-sm text-slate-500` |
| Table header | `text-xs font-medium uppercase tracking-wide text-slate-400` |
| Label (above input) | `text-sm font-medium text-slate-700` |
| Meta / timestamp | `text-xs text-slate-500` |
| Large metric | `text-3xl font-bold text-slate-900` |
| Monospace (OTP, codes) | `font-mono tracking-[0.5em]` |

---

## Spacing & Layout

- Vertical rhythm between sections: `space-y-6` on page root, `space-y-5` between sub-sections.
- Page padding is handled by the layout wrapper — individual pages start with `<div className="space-y-6">`.
- Use `gap-4` for card grids, `gap-3` for filter rows, `gap-1.5` for badge clusters.

### Responsive grid

```
1 col  →  sm:2 cols  →  lg:4 cols   (stat cards)
1 col  →              →  lg:2 cols   (detail sections)
```

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

---

## Surfaces

### Card

A content container. Used for stat blocks, detail panels.

```tsx
<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
```

### Table container

Wraps `<table>` to clip overflow and add the card treatment.

```tsx
<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
          <th className="px-6 py-3 text-left">Name</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        <tr className="transition-colors hover:bg-slate-50">
          <td className="px-6 py-3 text-slate-900">...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Empty state (inside table/list)

```tsx
<div className="py-16 text-center">
  <p className="text-sm text-slate-400">No items found.</p>
</div>
```

---

## Buttons

### Primary

```tsx
<button className="flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed">
  Submit
</button>
```

### Secondary (outlined)

```tsx
<button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40">
  Cancel
</button>
```

### Ghost / icon button

```tsx
<button className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
  <ExternalLink className="h-4 w-4" />
</button>
```

### Destructive

Same shape as Primary, swap colour:

```tsx
<button className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
  Delete
</button>
```

### Loading state

Always show a spinner alongside the label — never disable the button without visual feedback.

```tsx
import { Loader2 } from 'lucide-react'

{submitting && <Loader2 className="h-4 w-4 animate-spin" />}
{submitting ? 'Saving…' : 'Save'}
```

---

## Inputs & Forms

### Text input

```tsx
<input
  type="text"
  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
  placeholder="Enter value…"
/>
```

### Input with validation error

Add `border-red-400` when a field has an error. Always pair with an inline error message below.

```tsx
<input className="... border-red-400" />
<p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
```

### Select / dropdown

```tsx
<select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
  <option value="">All items</option>
</select>
```

### Label

Always placed above the input, never as a placeholder substitute.

```tsx
<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
  Email address
</label>
```

### Form spacing

Use `space-y-5` between form fields.

---

## Badges & Pills

### Status badge (rounded-full)

```tsx
// Active / success
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
  Active
</span>

// Suspended / warning
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
  Suspended
</span>

// Neutral tag (e.g. plan name)
<span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
  Starter
</span>
```

### Alert badge (with ring — use sparingly, for critical states only)

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-300">
  ⚠ 2 failed
</span>
```

---

## Feedback: Toasts & Banners

### Inline banner (persistent, inside page flow)

```tsx
// Error
<div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
  Failed to load data. Refresh to retry.
</div>

// Success
<div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
  Changes saved successfully.
</div>

// Warning / info
<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
  Your session is active on multiple devices.
</div>
```

### Toast (temporary, auto-dismiss after 4 s)

Use a `useState<{ type, msg } | null>` + `setTimeout` pattern. Same colour classes as banners, positioned at the top of the section that owns the action. Do not use a global toast portal unless the portal is already wired up.

```ts
const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

function showToast(type: 'success' | 'error', msg: string) {
  if (toastTimer.current) clearTimeout(toastTimer.current)
  setToast({ type, msg })
  toastTimer.current = setTimeout(() => setToast(null), 4000)
}
```

---

## Navigation tabs (segmented control)

Used for status filters (All / Active / Suspended).

```tsx
<div className="flex rounded-lg border border-slate-200 bg-white p-1">
  {TABS.map(t => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
        tab === t ? 'bg-brand-700 text-white' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {t}
    </button>
  ))}
</div>
```

---

## Pagination

```tsx
<div className="flex items-center justify-between text-sm">
  <p className="text-slate-500">Page {current} of {last}</p>
  <div className="flex gap-2">
    <button
      onClick={() => setPage(p => p - 1)}
      disabled={current === 1}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
    >
      <ChevronLeft className="h-4 w-4" /> Prev
    </button>
    <button
      onClick={() => setPage(p => p + 1)}
      disabled={current === last}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
    >
      Next <ChevronRight className="h-4 w-4" />
    </button>
  </div>
</div>
```

---

## Skeleton loaders

Show skeletons (not spinners) when the initial data for a section is loading. Match the shape of the real content so there is no layout shift.

```tsx
// Generic bar
<div className="h-4 w-32 animate-pulse rounded bg-slate-100" />

// Large metric placeholder
<div className="h-8 w-20 animate-pulse rounded bg-slate-100" />

// Table row placeholder
{Array.from({ length: 5 }).map((_, i) => (
  <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0">
    <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
    <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-100" />
  </div>
))}
```

---

## Icons

Use [Lucide React](https://lucide.dev) exclusively. Do not mix icon libraries.

- Standard size: `h-4 w-4`
- Sidebar / header: `h-4 w-4`
- Modal / feature icon container: `h-6 w-6` inside a `h-12 w-12 rounded-xl bg-brand-100`
- Always add `flex-shrink-0` when the icon sits next to text in a flex row

---

## Two-column auth layout

For login, registration, and account recovery pages:

```
┌─────────────────────────────┬──────────────────────────────┐
│  Dark brand panel (lg only) │  Form panel                  │
│  bg-brand-950               │  bg-slate-50                 │
│  w-1/2                      │  flex-1                      │
│                             │  max-w-sm form, centred      │
└─────────────────────────────┴──────────────────────────────┘
```

```tsx
<div className="flex min-h-screen">
  {/* Left — hidden on mobile */}
  <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand-950 p-12">
    {/* Logo, tagline, decorative list */}
  </div>

  {/* Right — full width on mobile, half on lg */}
  <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
    {/* Mobile logo (hidden on lg) */}
    <div className="mb-8 flex items-center gap-3 lg:hidden">...</div>
    <div className="w-full max-w-sm">
      {/* Form content */}
    </div>
  </div>
</div>
```

---

## Logo mark

```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
  <Server className="h-5 w-5 text-white" />
</div>
<span className="text-lg font-semibold text-white">New Ventures Hosting</span>
```

Swap `text-white` → `text-slate-800` when on a light background.

---

## Modal / dialog

Use a fixed overlay + centred card. No third-party modal library.

```tsx
{open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-slate-900">Dialog title</h2>
      <p className="mt-1 text-sm text-slate-500">Supporting description.</p>
      {/* content */}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => setOpen(false)} className="...secondary button...">Cancel</button>
        <button className="...primary button...">Confirm</button>
      </div>
    </div>
  </div>
)}
```

---

## Accessibility

- Every `<input>` must have an associated `<label htmlFor="...">`.
- Buttons that have no visible text label must have `aria-label="..."`.
- Disabled buttons must include `disabled` attribute (not just `opacity`).
- Interactive elements must be reachable by keyboard (`Tab` / `Enter` / `Space`).
- Use `tabIndex={-1}` only for supplementary icon buttons (e.g. show/hide password) where the primary action is already reachable by keyboard.
- Skeleton loaders should include `aria-hidden="true"` or be replaced with a `role="status"` live region.

---

## Code conventions

### File structure

```
app/
  (auth)/         # public pages: login, register, forgot-password
  (portal)/       # client-facing authenticated pages
    layout.tsx    # shared shell: sidebar + topbar
    dashboard/
    services/
    billing/
components/       # shared UI (Sidebar, Topbar, etc.)
lib/
  api.ts          # API client
  csrfStore.ts    # CSRF token store (window singleton)
  authEvents.ts   # cross-module event bridge
contexts/
  AuthContext.tsx # global auth state
types/            # TypeScript types (no logic)
```

### Component rules

- One component per file. Small helper components (e.g. `StatusBadge`) may live in the same file as the page that owns them.
- `'use client'` at the top of every file that uses React state, effects, or browser APIs.
- Server Components are the default — add `'use client'` only when needed.
- Extract repeated JSX into a named component, not an inline function, so React can reconcile it properly.

### Data fetching

- Fetch inside `useEffect` on the client for dashboard/list pages.
- Always show a loading skeleton, an error state, and the empty state — never leave the UI blank.
- Debounce search inputs with a 350 ms `setTimeout` before updating the filter state that triggers a fetch.

### API calls

```ts
import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'

// GET
const data = await api.get<MyType>('/resource')

// POST / PATCH / DELETE
await api.post('/resource', { key: 'value' })
await api.patch('/resource/1', { key: 'value' })
await api.delete('/resource/1')          // no body
await api.delete('/resource/1', { password }) // with body
```

All mutating requests automatically include the `X-XSRF-TOKEN` header from the in-memory CSRF store. Do not read cookies manually.

### Error handling

Always catch `ApiError` and map status codes to user-friendly messages. Never show raw error messages from the API to the user.

```ts
try {
  await api.post('/resource', payload)
} catch (err) {
  const e = err as ApiError
  if (e.status === 422 && e.errors) {
    // map field errors
  } else if (e.status === 429) {
    setError('Too many attempts. Please wait a minute and try again.')
  } else {
    setError('Something went wrong. Please try again.')
  }
}
```

### Dates

Format dates with `Intl.DateTimeFormat` — do not use a date library.

```ts
function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
```

### Currency

```ts
function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    parseFloat(amount)
  )
}
```

---

## What not to do

| Avoid | Use instead |
|---|---|
| `gray-*`, `zinc-*`, `neutral-*` | `slate-*` |
| Inline styles (`style={{}}`) | Tailwind classes |
| External toast / modal libraries | Native patterns documented above |
| `localStorage` for auth tokens | In-memory state / HttpOnly cookies |
| `window.location.replace` for SPA navigation | `router.replace()` from `next/navigation` |
| Multiple icon libraries | Lucide React only |
| `<p>` for headings | Semantic `<h1>`–`<h3>` tags |
| Hardcoded pixel values | Tailwind spacing scale |
