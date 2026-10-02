# Wayfarer Rentals UI

Standalone Angular frontend for the customer workflows currently supported by the Car Rental API.

## Run Locally

Use a supported Node.js release for the Angular toolchain: Node 22.22.3+, 24.15+, or 26+.

```powershell
npm install
npm start
```

The Angular dev server runs at `http://localhost:4200` and calls the backend directly at `http://localhost:8081/api/v1`. The backend must allow the frontend origin (`http://localhost:4200`) through CORS. Production deployments should route `/api/v1` through a same-origin gateway or reverse proxy; do not add access tokens to API URLs.

## Frontend Routes

- `/sign-in` and `/register` use the existing authentication endpoints.
- `/dashboard` is the authenticated customer overview.
- `/explore` searches availability and runs the existing quote, hold, price-lock, and booking-create operations.
- `/profile` edits `/users/me`, addresses, and KYC metadata.
- `/reservations/current` shows only the reservation created in the current in-memory session and exposes its confirm/cancel actions.

The browser URL is allowlisted at startup. Unknown paths become `/not-found`; fragments and unapproved query parameters are removed with history replacement. Search URLs retain only validated location and date values. Access and refresh tokens stay in memory, never in browser storage, route state, query parameters, or fragments. A page reload requires signing in again.

## Security Boundary

Angular guards and the UI's session-only reservation view are navigation controls, not authorization. The backend must enforce resource ownership and role permissions for every API operation.

The current backend is not yet safe for multi-user use: its security filter requires authentication but does not enforce resource ownership or controller roles; `/users/me` and related methods accept a caller-controlled `X-User-Id` header and default to the shared `anonymous` identity. Booking and hold commands also need to bind the resource owner to the authenticated JWT subject. Resolve these backend checks before exposing the application to real users. The frontend intentionally does not manufacture an identity header or treat a route guard as a security control.

Other API limitations reflected in the UI:

- Availability returns vehicle IDs but no vehicle model/category details; the frontend does not display those backend identifiers.
- Booking APIs have no list or read endpoint, so reservation details cannot be restored after reload or opened from a copied URL.
- KYC accepts document metadata only; its current API does not accept image bytes.
- Fleet, payment, billing, fulfilment, notification, and admin APIs are not exposed as customer screens. Several lack read contracts or server-side role/ownership rules required for a safe UI.

## Checks

```powershell
npm test -- --watch=false
npm run build
```
