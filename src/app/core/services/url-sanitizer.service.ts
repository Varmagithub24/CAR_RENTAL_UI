import { Injectable } from '@angular/core';

const applicationPaths = new Set([
  '/',
  '/sign-in',
  '/register',
  '/verify-email',
  '/dashboard',
  '/explore',
  '/profile',
  '/reservations/current',
  '/forbidden',
  '/not-found',
]);
const locationIds = new Set(['loc-1', 'loc-2']);
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isValidLocalDateTime(value: string): boolean {
  return localDateTimePattern.test(value) && Number.isFinite(Date.parse(value));
}

@Injectable({ providedIn: 'root' })
export class UrlSanitizerService {
  sanitizeInitialUrl(): void {
    const url = new URL(window.location.href);
    const pathname = applicationPaths.has(url.pathname) ? url.pathname : '/not-found';
    const safeQuery = new URLSearchParams();

    if (pathname === '/explore') {
      const location = url.searchParams.get('location') ?? '';
      const start = url.searchParams.get('start') ?? '';
      const end = url.searchParams.get('end') ?? '';
      if (locationIds.has(location) && isValidLocalDateTime(start) && isValidLocalDateTime(end)
        && Date.parse(end) > Date.parse(start)) {
        safeQuery.set('location', location);
        safeQuery.set('start', start);
        safeQuery.set('end', end);
      }
    }

    const search = safeQuery.size ? `?${safeQuery.toString()}` : '';
    const verificationToken = pathname === '/verify-email'
      ? new URLSearchParams(url.hash.slice(1)).get('token')
      : null;
    const fragment = verificationToken && /^[A-Za-z0-9_-]{43}$/.test(verificationToken)
      ? `#token=${verificationToken}`
      : '';
    const safeUrl = `${pathname === '/' ? '/dashboard' : pathname}${search}${fragment}`;
    const currentUrl = `${url.pathname}${url.search}${url.hash}`;
    if (currentUrl !== safeUrl) {
      window.history.replaceState(window.history.state, document.title, safeUrl);
    }
  }
}