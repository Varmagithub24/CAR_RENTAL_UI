import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-system-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="system-page">
      <span class="system-code">{{ code() }}</span>
      <h1 class="section-title">{{ title() }}</h1>
      <p>{{ message() }}</p>
      <a class="btn btn-primary" routerLink="/dashboard">Back to overview <span aria-hidden="true">→</span></a>
    </main>
  `,
  styles: `
    .system-page { display: grid; min-height: 60vh; align-content: center; justify-items: center; text-align: center; gap: .5rem; max-width: 560px; margin: 0 auto; padding: 0 1.5rem; }
    .system-code { font: 800 12px var(--font-sans); text-transform: uppercase; letter-spacing: .18em; color: var(--color-blue-600); }
    h1 { margin: .5rem 0; }
    p { margin: 0 0 1.5rem; color: var(--color-slate-500); line-height: 1.6; }
    a span { font-size: 18px; }
  `,
})
export class SystemPageComponent {
  readonly code = input('');
  readonly title = input('');
  readonly message = input('');
}