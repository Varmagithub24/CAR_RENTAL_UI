import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-system-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="system-page">
      <span class="system-code">{{ code() }}</span>
      <h1>{{ title() }}</h1>
      <p>{{ message() }}</p>
      <a routerLink="/dashboard">Back to overview <span aria-hidden="true">→</span></a>
    </main>
  `,
  styles: `
    .system-page { display: grid; min-height: 50vh; align-content: center; justify-items: start; max-width: 560px; margin: 0 auto; }
    .system-code { color: var(--coral-dark); font-size: 11px; font-weight: 700; letter-spacing: 1.2px; }
    h1 { margin: 12px 0; font: 600 38px/1.1 var(--font-display); }
    p { margin: 0 0 22px; color: var(--muted); line-height: 1.6; }
    a { color: var(--moss-dark); font-weight: 700; text-decoration: none; }
    a span { padding-left: 7px; font-size: 18px; }
  `,
})
export class SystemPageComponent {
  readonly code = input('');
  readonly title = input('');
  readonly message = input('');
}