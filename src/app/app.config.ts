import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { apiSecurityInterceptor } from './core/http/api-security.interceptor';
import { UrlSanitizerService } from './core/services/url-sanitizer.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(UrlSanitizerService).sanitizeInitialUrl()),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiSecurityInterceptor]))
  ]
};
