import { TestBed } from '@angular/core/testing';
import { UrlSanitizerService } from './url-sanitizer.service';

describe('UrlSanitizerService', () => {
  let sanitizer: UrlSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UrlSanitizerService] });
    sanitizer = TestBed.inject(UrlSanitizerService);
  });

  afterEach(() => window.history.replaceState({}, '', '/'));

  it('keeps only approved search state and removes token-like URL data', () => {
    window.history.replaceState(
      {},
      '',
      '/explore?location=loc-1&start=2026-10-02T10%3A00&end=2026-10-03T10%3A00&accessToken=secret#refresh_token=secret',
    );

    sanitizer.sanitizeInitialUrl();

    expect(window.location.pathname).toBe('/explore');
    expect(window.location.search).toBe('?location=loc-1&start=2026-10-02T10%3A00&end=2026-10-03T10%3A00');
    expect(window.location.hash).toBe('');
  });

  it('replaces invalid and unknown paths without preserving their parameters', () => {
    window.history.replaceState({}, '', '/admin/private?password=secret#token');

    sanitizer.sanitizeInitialUrl();

    expect(window.location.pathname).toBe('/not-found');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
  });

  it('drops invalid search values from the URL', () => {
    window.history.replaceState({}, '', '/explore?location=../../admin&start=not-a-date&end=2026-10-03T10%3A00');

    sanitizer.sanitizeInitialUrl();

    expect(window.location.pathname).toBe('/explore');
    expect(window.location.search).toBe('');
  });
});