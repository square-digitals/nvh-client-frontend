# NVH Client Portal — Build Roadmap

Ordered by dependency. Each phase must be complete before the next begins.

---

## Phase 1 — Project Foundation

Set up everything that every page depends on before writing a single page.

- [x] Configure Tailwind v4 `@theme` with brand colour tokens in `globals.css`
- [x] Add `NEXT_PUBLIC_API_URL` to `.env.development` and `.env.production`
- [x] Create `lib/api.ts` — Axios instance with `withCredentials`, base URL, Accept/Content-Type headers
- [x] Create `lib/csrfStore.ts` — in-memory singleton that holds the XSRF token
- [x] Wire CSRF: on every response that sets cookies, read `XSRF-TOKEN` and save to store; on every mutating request, inject `X-XSRF-TOKEN` header from store
- [x] Add global 401 interceptor → redirect to `/login`
- [x] Add global 403 interceptor → check message, redirect to `/verify-email` or show suspension banner
- [x] Export `ApiError` type with `status`, `message`, `errors` fields
- [x] Create `types/index.ts` — `Client`, `Service`, `Invoice` TypeScript types
- [x] Create `contexts/AuthContext.tsx` — `client`, `setClient`, `logout` exported via `useAuth()`
- [x] Create utility functions: `fmtDate()`, `fmtCurrency()` (using `Intl`, no libraries)
- [x] Install Lucide React

---

## Phase 2 — App Shell & Route Groups

Set up the routing skeleton so pages have a home before they are built.

- [x] Create `app/(auth)/layout.tsx` — bare layout (no sidebar), `bg-slate-50`
- [x] Create `app/(portal)/layout.tsx` — authenticated shell with `<Sidebar>` + `<Topbar>`, wraps `AuthContext`
- [x] Build `components/Sidebar.tsx` — `bg-brand-950`, nav links for Dashboard / Services / Billing, logo mark
- [x] Build `components/Topbar.tsx` — page title slot, user avatar/name, logout button
- [x] Add route guard to `(portal)/layout.tsx` — call `GET /api/auth/me` on mount; redirect to `/login` on 401
- [x] Create placeholder pages for all routes (return `null` or a heading) so navigation works end-to-end

---

## Phase 3 — Auth Pages

Public pages. No auth required.

### Register — `/register`
- [x] Two-column layout (dark brand panel left, form right)
- [x] Fields: name, email, password, password_confirmation
- [x] `POST /api/auth/register` on submit
- [x] On 201 → redirect to `/verify-email`
- [x] On 422 → map field errors inline
- [x] Loading spinner on button while submitting

### Login — `/login`
- [x] Same two-column layout
- [x] Fields: email, password
- [x] `POST /api/auth/login` on submit
- [x] On 200 → check `email_verified_at`; redirect to `/verify-email` or `/dashboard`
- [x] On 422 → show credentials error
- [x] On 403 → show account suspended message
- [x] On 429 → show rate limit message

### Verify Email — `/verify-email`
- [x] Static page — no API call
- [x] Tell user to check their inbox
- [x] Link back to `/login`

### Forgot Password — `/forgot-password`
- [x] Field: email
- [x] `POST /api/auth/forgot-password`
- [x] Always show "If that email is registered, a reset link has been sent." regardless of response

### Reset Password — `/reset-password`
- [x] Parse `token` + `email` from query string
- [x] Fields: password, password_confirmation
- [x] `POST /api/auth/reset-password`
- [x] On 200 → redirect to `/login` with success message
- [x] On 422 → check `errors.token` for "invalid" → show "Link expired" message

---

## Phase 4 — Dashboard

First authenticated page.

- [x] Call `GET /api/auth/me`, `GET /api/services`, `GET /api/invoices` in parallel on mount
- [x] Show skeleton loaders while loading (match card/row shapes)
- [x] Stat cards (1 col → sm:2 → lg:4): Total Services, Active Services, Unpaid Invoices, Overdue Invoices
- [x] Recent Services table (latest 5) with status badge + link to `/services/[id]`
- [x] Recent Invoices table (latest 5) with amount, due date, status badge + link to `/invoices/[id]`
- [x] Empty states when no data

---

## Phase 5 — Services

### Services List — `/services`
- [x] `GET /api/services` on mount with skeleton loader
- [x] Segmented tab filter: All / Active / Provisioning / Pending / Suspended / Terminated
- [x] Table: name, domain, type, status badge, created date, actions
- [x] Empty state when no services
- [x] "Request Service" button → `/services/new`

### New Service — `/services/new`
- [x] Fields: name, domain, type (defaults to `wordpress`)
- [x] `POST /api/services`
- [x] On 201 → redirect to `/services/[id]`
- [x] On 422 → inline field errors (especially domain validation)

### Service Detail — `/services/[id]`
- [x] `GET /api/services/{id}` on mount
- [x] Show all fields in a detail card
- [x] Status badge matching the service lifecycle table
- [x] If status is `pending_approval` or `provisioning` → start polling every 30s, stop on terminal status
- [x] Show `service.url` as a live link when `active`
- [x] Show `failed_reason` when `failed` or `rejected`
- [x] "Terminate" button (visible when not already terminated/rejected) → confirm modal → `DELETE /api/services/{id}`
- [x] On terminate success → update status to `terminated` in local state

---

## Phase 6 — Billing (Invoices)

### Invoices List — `/billing`
- [ ] `GET /api/invoices` on mount with skeleton loader
- [ ] Tab filter: All / Unpaid / Paid / Overdue / Void
- [ ] Table: external ID, amount (formatted NGN), period, due date, status badge
- [ ] Empty state when no invoices

### Invoice Detail — `/billing/[id]`
- [ ] `GET /api/invoices/{id}` on mount
- [ ] Detail card: all fields, formatted amount and dates
- [ ] Status badge

---

## Phase 7 — Polish & Hardening

- [ ] Add `aria-label` to all icon-only buttons
- [ ] Verify every `<input>` has a paired `<label htmlFor>`
- [ ] Add `aria-hidden="true"` to all skeleton loaders
- [ ] Test keyboard navigation across all forms and interactive elements
- [ ] Verify `withCredentials` is set on all requests (no silent 401s)
- [ ] Verify CSRF token is injected on all POST/DELETE requests
- [ ] Test 429 rate limit UI on login
- [ ] Test session expiry: expire cookie, confirm 401 redirects to `/login`
- [ ] Test unverified email flow: confirm 403 redirects to `/verify-email`
- [ ] Test service polling: confirm it stops on `active`, `failed`, `rejected`
- [ ] Test Docker build locally: `docker build -t nvh-client .`
- [ ] Commit and push to `dev`, raise PR to `staging`

---

## Page → Route Summary

| Page | Route | Phase |
|---|---|---|
| Login | `/login` | 3 |
| Register | `/register` | 3 |
| Verify Email | `/verify-email` | 3 |
| Forgot Password | `/forgot-password` | 3 |
| Reset Password | `/reset-password` | 3 |
| Dashboard | `/dashboard` | 4 |
| Services List | `/services` | 5 |
| New Service | `/services/new` | 5 |
| Service Detail | `/services/[id]` | 5 |
| Invoices List | `/billing` | 6 |
| Invoice Detail | `/billing/[id]` | 6 |
