# Implementation Plan — DRIVE visual redesign (Angular 22)

Visual-only redesign of the car-rental Angular app at
`j:\CODEBASE\CAR_RENTAL_UI\.worktrees\drive-redesign` to match the DRIVE Figma
(`j:\CODEBASE\FIGMA\src\App.tsx` + `index.css`). ALL Angular logic, bindings,
reactive forms, signals, routerLinks, handlers, selectors, and `@Input()`/`input()`
APIs are preserved EXACTLY. Only SCSS and template markup/classes change. No new
dependencies, routes, or components. No Tailwind — reproduce the look in pure SCSS.

## Design decisions (made during exploration)

- **Decision — put reusable primitives in global `styles.scss`, not per-component.**
  The production build enforces `anyComponentStyle maximumError: 8kB` (angular.json).
  Current component SCSS is 2.7–4.6kB; DRIVE styling is richer. To stay safely under
  budget and avoid duplication, shared primitives (btn variants, badge tones, panel,
  section-kicker, section-title, label, field) live as global classes in `styles.scss`.
  Components reference them and add only layout-specific SCSS. Rationale: keeps every
  component style file small and the look consistent.
- **Decision — keep the light theme as default; retune `[data-theme='dark']` to a
  slate-950 palette** by overriding the same CSS custom properties. No component reads
  the theme directly, so retuning the vars is sufficient and low-risk.
- **Decision — logo "Zap" tile is an inline SVG lightning bolt** (no icon dependency).
  A small inline `<svg viewBox="0 0 24 24">` with the bolt path, sized ~2.25rem tile.
- **Decision — the DRIVE wordmark replaces "Wayfarer"/"wayfarer."** everywhere; the
  avatar/initials "W" marks become "DRIVE"-appropriate (lightning tile or user initials).
- **Decision — Figma→route mapping (no new routes).** Dashboard←Figma Dashboard;
  explore←Figma Search/Home SearchBox + CarCard; profile←Figma Profile; reservation
  detail←Figma Booking/Pickup; auth←Figma SignIn/Register/Verify; system-page←Figma
  empty/system vibe; feedback←Figma amber/rose callouts.

## Design tokens to put in `src/styles.scss` (from Figma `index.css` @theme + brief)

Define on `:root` as CSS custom properties (keep existing resets, add DRIVE values):

```
--font-sans: 'Manrope', sans-serif;   /* body font */
--color-blue-500: #3478f6;
--color-blue-600: #1f66e5;   /* primary */
--color-blue-700: #1854c4;   /* primary hover */
--color-slate-950: #101217;  /* ink / dark surfaces */
--color-slate-500: #64748b;
--color-slate-400: #94a3b8;  /* muted text */
--color-slate-200: #e2e8f0;  /* borders */
--color-slate-100: #f1f5f9;
--color-slate-50:  #f8fafc;
--color-ivory:     #f3f1ec;  /* warm section bg */
--color-emerald-600:#059669; --color-emerald-700:#047857; --color-emerald-50:#ecfdf5;
--color-amber-600:#d97706; --color-amber-700:#b45309; --color-amber-50:#fffbeb;
--color-blue-50:#eff6ff; --color-blue-700-text:#1d4ed8;
--color-white:#ffffff;
```

Google Fonts import (replace the DM Sans import at the top of styles.scss):
`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`

Body: `background:#fff; color:var(--color-slate-950); font-family:var(--font-sans);`
Focus-visible outline color → DRIVE blue (`var(--color-blue-500)`). Keep
`prefers-reduced-motion`, `::selection` (recolor to blue), global `* box-sizing`.
Retune `[data-theme='dark']`: `--surface`/bg → slate-950, ink → white, borders → slate-800.

Reusable helper classes to add to `styles.scss` (approximating the Figma `@apply`):

- `.btn` base: inline-flex; height:3rem; align/justify center; gap:.5rem; border-radius:.75rem;
  padding:0 1.25rem; font:700 14px var(--font-sans); transition; `&:disabled{opacity:.5;cursor:not-allowed}`.
- `.btn-primary`: bg blue-600; color #fff; hover bg blue-700; box-shadow 0 10px 30px rgba(31,102,229,.2).
- `.btn-secondary`: bg #fff; color slate-950; 1px border slate-200; hover border slate-400.
- `.btn-ghost`: color slate-700; hover bg slate-100.
- `.btn-dark`: bg slate-950; color #fff; hover bg #1e293b.
- `.badge`: border-radius:9999px; padding:.25rem .75rem; font:700 12px. tones `.badge-blue`
  (blue-50/blue-700), `.badge-green` (emerald-50/emerald-700), `.badge-amber`
  (amber-50/amber-700), `.badge-slate` (slate-100/slate-600).
- `.panel`: border-radius:1rem; 1px border slate-200; bg #fff; padding:1.5rem.
- `.section-kicker`: margin-bottom:.75rem; font:800 12px; text-transform:uppercase;
  letter-spacing:.18em; color:blue-600.
- `.section-title`: font:900 1.875rem var(--font-sans); letter-spacing:-.02em; color:slate-950;
  (`@media(max-width:640px){font-size:1.75rem}`).
- `.label`: margin-bottom:.25rem; font:800 11px; uppercase; letter-spacing:.05em; color:slate-400.
- `.field-label`: display:block; font:700 14px; color:slate-700; margin-bottom:1.25rem.
- `.field`: margin-top:.5rem; height:3rem; width:100%; border-radius:.75rem; 1px border slate-200;
  bg #fff; padding:0 1rem; font:500 14px; outline:none; transition;
  `&:focus{border-color:blue-500; box-shadow:0 0 0 4px rgba(52,120,246,.10)}`.
- `.icon-tile`: ~2.75rem square; border-radius:.75rem; bg blue-50; color blue-600; grid place-items center.
- `.logo-tile`: ~2.25rem square; border-radius:.75rem; bg slate-950; color #fff; grid place-items center
  (inverse variant: bg #fff; color slate-950).

Verify (whole redesign, run inside the worktree):
`npm install` (node_modules is absent in the worktree) then `npm run build` succeeds
with no budget error, and `npm test -- --watch=false` (vitest, single run) passes.

---

## Target 1 — `src/styles.scss` (GLOBAL)

- [ ] 1. Replace Wayfarer tokens/font import with the DRIVE tokens and helper classes above.
      Keep every global reset, focus-visible rule (recolor), `prefers-reduced-motion`,
      `::selection`, `[data-theme='dark']` (retuned). Add the `.btn*/.badge*/.panel/.field/.label/
      .section-*/.icon-tile/.logo-tile` helpers.
      Files: `src/styles.scss`
      Verify: `npm run build` compiles with no SCSS error.

## Target 9 — `src/app/shared/components/feedback-message.component.ts` (shared)

PRESERVE EXACTLY: selector `app-feedback-message`; `message = input<string|null>(null)`;
`variant = input<'error'|'success'|'info'>('error')`; the template `@if (message())` guard,
`[class]="'feedback ' + variant()"`, and `[attr.role]` expression.

- [ ] 2. Restyle inline `styles` to DRIVE callouts (rounded-xl pill cards): `.error` → rose-50
      bg / rose-700 text / rose-200 border; `.success` → emerald-50/emerald-700/emerald-200;
      `.info` → blue-50/blue-700/blue-200. Keep border-radius ~.75rem, Manrope, font-weight 600.
      Do NOT change the TS class, selector, inputs, or template bindings.
      Files: `src/app/shared/components/feedback-message.component.ts` (styles block only)
      Verify: `npm run build`; `npm test -- --watch=false` still passes.

## Target 8 — `src/app/features/system/system-page.component.ts` (403/404)

PRESERVE EXACTLY: selector `app-system-page`; `code = input('')`, `title = input('')`,
`message = input('')`; template bindings `{{ code() }}`, `{{ title() }}`, `{{ message() }}`;
`routerLink="/dashboard"`.

- [ ] 3. Restyle inline template/styles to DRIVE: centered column, `.section-kicker`-style code
      label (blue-600 uppercase), black `.section-title` heading, slate-500 muted message,
      a `.btn.btn-primary` back-to-overview link (keep `routerLink="/dashboard"` and the arrow span).
      Files: `src/app/features/system/system-page.component.ts` (template + styles only)
      Verify: `npm run build`.

## Target 2 — `src/app/layout/app-shell.component.{html,scss}`

PRESERVE EXACTLY (app-shell.component.ts is unchanged): `routerLink="/dashboard"`,
`routerLink="/explore"`, `routerLink="/profile"`; `routerLinkActive="active"` and
`[routerLinkActiveOptions]="{ exact: true }"` on the Overview links; `(click)="signOut()"`;
`<router-outlet />`; both desktop `.primary-nav` and `.mobile-nav` link sets.

- [ ] 4. Rebrand to DRIVE in `app-shell.component.html`: replace the `W wayfarer.` wordmark with
      a `.logo-tile` inline-SVG lightning bolt + `DRIVE` wordmark (keep `routerLink="/dashboard"`,
      `aria-label` → "DRIVE home"). Nav items keep routerLinks; restyle active state as a
      slate-950 pill, idle slate-600, hover slate-100. Topbar: breadcrumb → slate-400 uppercase,
      avatar → slate-950 initials circle, profile link keeps `routerLink="/profile"`. Footer
      wordmark/text → DRIVE. Sign-out keeps `(click)="signOut()"`. Keep every `aria-label`.
      Files: `src/app/layout/app-shell.component.html`, `src/app/layout/app-shell.component.scss`
      Verify: `npm run build`; `npm test -- --watch=false` passes (app spec renders router-outlet).

## Target 3 — Auth: `sign-in.component.html`, `register.component.html`,
`verify-email.component.html`, `auth-pages.component.scss` (shared)

PRESERVE EXACTLY per file:
- sign-in: `[formGroup]="form"`, `(ngSubmit)="submit()"`, `formControlName="email"`,
  `formControlName="password"`, both `@if (form.controls.*.invalid && …touched)` `<small>` blocks,
  `[disabled]="busy()"` + `{{ busy() ? 'Signing in…' : 'Sign in' }}`, `<app-feedback-message
  [message]="errorMessage()" />`, `routerLink="/register"`, `routerLink="/verify-email"`.
- register: `[formGroup]="form"`, `(ngSubmit)="submit()"`, formControlNames firstName/lastName/
  email/password/confirmPassword, every `@if` validation `<small>`, the `@if (!successMessage())`
  / `@else` branch with `(click)="goToSignIn()"`, both feedback-message tags (error + success),
  `routerLink="/sign-in"`, `routerLink="/verify-email"`.
- verify-email: `[formGroup]="profile"` + `(ngSubmit)="confirm()"` (firstName/lastName),
  `[formGroup]="request"` + `(ngSubmit)="resend()"` (email), the `@if (confirmed())` /
  `@else if (hasToken())` / `@else` branches, `(click)="requestNewLink()"`, `[disabled]="busy()"`
  dynamic button labels, both feedback-message tags, `routerLink="/sign-in"`.

- [ ] 5. Restyle the three auth templates + shared `auth-pages.component.scss` to DRIVE.
      Sign-in: two-column split — left column DRIVE logo + `.section-kicker` "Welcome back" +
      black heading + `.field`/`.field-label` inputs + `.btn.btn-primary` + register link; right
      column full-bleed car photo with slate-950 gradient overlay + testimonial; `@media
      (max-width:780px)` collapses to form only (existing breakpoint). Register: centered card on
      slate-50, logo, kicker "Join Drive", heading, two-col field grid, create-account button,
      sign-in link. Verify: centered small card, blue-50 `.icon-tile`, kicker, heading, primary +
      ghost buttons. Rebrand all "Wayfarer"/"wayfarer." marks → DRIVE lightning tile + wordmark.
      Keep every binding/handler/routerLink listed above and all `id`/`for`/`autocomplete`/`aria`.
      Files: `src/app/features/auth/sign-in.component.html`, `.../register.component.html`,
      `.../verify-email.component.html`, `.../auth-pages.component.scss`
      Verify: `npm run build`; `npm test -- --watch=false` passes.

## Target 4 — `src/app/features/dashboard/dashboard.component.{html,scss}`

PRESERVE EXACTLY: `{{ firstName }}` interpolation (TS getter unchanged),
`<app-feedback-message [message]="errorMessage()" />`, `routerLink="/explore"`,
`routerLink="/profile"` (all occurrences). TS unchanged (only `profile()` signal + firstName
getter + errorMessage exist — do NOT invent booking/data fields).

- [ ] 6. Restyle to DRIVE Dashboard: `.section-kicker` date label (static), black
      "Good morning, {{ firstName }}." greeting (change greeting text, keep the interpolation),
      a `.btn.btn-primary` "Find a car" linking `routerLink="/explore"`. Keep the feedback-message.
      Represent the Figma featured-booking dark card and "Ready for pickup?" checklist as STATIC
      presentational markup (no data bindings exist for them) with a slate-950 `.panel` card and
      an amber `.badge`. Quick-action `.panel` cards link to existing routes only (`/explore`,
      `/profile`) with blue-50 `.icon-tile`s. Do not add routes.
      Files: `src/app/features/dashboard/dashboard.component.html`, `.../dashboard.component.scss`
      Verify: `npm run build`.

## Target 5 — `src/app/features/explore/explore.component.{html,scss}`

ACTUAL availability-response shape (`AvailabilityResponse` in api.models.ts): only
`locationId: string`, `startTime`, `endTime`, `availableVehicleIds: string[]`. There is NO
model/name/price/seats/fuel per vehicle — the current template already renders "Available car N".
Cards must bind to `vehicleId` + index only; seats/transmission/fuel/price labels are STATIC
decorative text, NOT invented data fields.

PRESERVE EXACTLY: `[formGroup]="form"`, `(ngSubmit)="search()"`, formControlNames `locationId`
(with its two `<option value="loc-1|loc-2">`), `start`/`end` (`type="datetime-local"`),
`vehicleCategory` (economy/compact/sedan/suv/premium options), `currency` (USD/EUR/INR options);
`[disabled]="busy()"` + `{{ busy() ? 'Searching…' : 'Search cars' }}`; `<app-feedback-message
[message]="errorMessage()" />`; the control-flow chain `@if (busy())` / `@else if (results(); as
result)` / `@else if (searchFailed())` / `@else if (hasSearched())` / `@else`; inside results:
`result.availableVehicleIds.length`, the location ternary, `@if (…length === 0)` empty state,
`@for (vehicleId of result.availableVehicleIds; track vehicleId; let index = $index)`;
`(click)="reserve(vehicleId)"`, `[disabled]="!!bookingVehicle()"`, `{{ bookingVehicle() ===
vehicleId ? 'Reserving…' : 'Reserve' }}`; the retry `(click)="search()"` button.

- [ ] 7. Restyle search form into a DRIVE SearchBox bar (rounded-2xl white panel, soft shadow,
      `.field`-style selects/inputs with blue icon affordances) keeping all five reactive controls
      and their option values. Render each available vehicle as a DRIVE CarCard
      (`rounded-3xl` bordered card, image/art area, blue-600 type kicker, name "Available car N",
      STATIC spec row with seats/transmission/fuel icons, STATIC price "/ day" line, and the
      reserve `.btn` calling `reserve(vehicleId)`). Restyle loading/empty/failed/prompt states to
      DRIVE. Keep the full `@if/@else`/`@for` chain and every binding above.
      Files: `src/app/features/explore/explore.component.html`, `.../explore.component.scss`
      Verify: `npm run build`.

## Target 6 — `src/app/features/profile/profile.component.{html,scss}`

PRESERVE EXACTLY: `[formGroup]="profileForm"` + `(ngSubmit)="saveProfile()"` (firstName,
lastName, email, phone, preferredLanguage with en/hi/fr options); `[formGroup]="addressForm"` +
`(ngSubmit)="addAddress()"` (label, line1, line2, city, state, postalCode, country, isPrimary
checkbox); `[formGroup]="kycForm"` + `(ngSubmit)="submitKyc()"` (documentType jpeg/png, fileName,
sizeBytes number min/max, licenseNumber, issuer); all `@if (<ctrl>.invalid && …touched) <small>`
blocks; the three `[disabled]="*Busy()"` buttons with dynamic labels; all six feedback-message
tags (`profileError/profileNotice/addressError/addressNotice/kycError/kycNotice`); the
`@if (addresses().length)` / `@else` branch and `@for (address of addresses(); track
address.addressId)` with `{{ address.label }}`, `{{ address.line1 }}…`, `@if (address.isPrimary)`;
`{{ kyc()?.status || 'Not submitted' }}` and `[class.status-pending]="kyc()?.status === 'pending'"`;
the `.api-limitation` note.

- [ ] 8. Restyle to DRIVE Profile: `.section-kicker` "Your account", black "Profile" heading,
      amber verification callout (static button-style link — keep it inside the page, no new route),
      personal-info `.panel` with a slate-950 avatar circle (static initials), name + member-since
      (static), `.field`/`.field-label` grid for the real controls, `.btn.btn-primary` save button.
      Keep addresses + KYC sections (restyle as `.panel`s) with all their bindings. Email field
      stays editable per the existing control (no readonly change — logic preserved).
      Files: `src/app/features/profile/profile.component.html`, `.../profile.component.scss`
      Verify: `npm run build`; `npm test -- --watch=false` passes.

## Target 7 — `src/app/features/reservations/reservation-detail.component.{html,scss}`

PRESERVE EXACTLY: `routerLink="/explore"` (back link + unavailable-state CTA); `@if (booking();
as reservation)` / `@else`; `{{ reservation.status }}` and `[class.confirmed]="reservation.status
=== 'CONFIRMED'"`; both feedback-message tags (`errorMessage`, `notice`); `{{
reservation.pickupDateTime | date:'medium' }}` and `{{ reservation.returnDateTime | date:'medium'
}}` (DatePipe import stays); the three status `@if` blocks — `(click)="confirm()"` with
`[disabled]="busy()"` + dynamic label, `(click)="cancel()"` with `[disabled]="busy()"`, and the
`status === 'CANCELLED'` copy.

- [ ] 9. Restyle to DRIVE Booking/Pickup vibe: status `.badge` (amber pending / emerald confirmed
      driven by the existing `.confirmed` class), car image/art area + pick-up/return label grid
      using `.label` + DatePipe values, a payment-summary `.panel` (STATIC presentational figures,
      no invented fields), and a timeline block (static). Keep max-width centered layout. Keep
      every binding/handler/routerLink above.
      Files: `src/app/features/reservations/reservation-detail.component.html`,
      `.../reservation-detail.component.scss`
      Verify: `npm run build`.

---

## Final verification (run once at the end, inside the worktree)

1. `cd j:\CODEBASE\CAR_RENTAL_UI\.worktrees\drive-redesign`
2. `npm install` — node_modules is NOT present in the worktree; required before build/test.
3. `npm run build` — production build; MUST succeed with no `anyComponentStyle` budget error
   (keep each component SCSS < 8kB; shared primitives live in global styles.scss).
4. `npm test -- --watch=false` — vitest single run (per README "Checks"); all existing specs
   (`app.spec`, `auth.guard.spec`, `safe-error.service.spec`, `url-sanitizer.service.spec`) pass.

## Reported-but-unverifiable concerns (never-dismiss)

- The availability API returns only vehicle IDs (no model/price/specs). CarCard spec/price text
  is therefore STATIC decoration; this is faithful to the Figma look but is not real data. Flagged,
  not silently invented. (README documents this backend limitation.)
- Figma pages (hold/review/payment/success/bookings/kyc/pickup/active/return/completed) have no
  matching Angular route; per constraints we do NOT add routes/components — their visual motifs are
  borrowed only into the existing screens. No behavior change.
- `npm install` network/registry availability could not be verified from the planning step; the
  build/test verification assumes install succeeds in the execution environment.
