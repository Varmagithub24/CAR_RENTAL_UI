import { Component, input } from '@angular/core';

@Component({
  selector: 'app-feedback-message',
  standalone: true,
  template: `
    @if (message()) {
      <p class="feedback" [class]="'feedback ' + variant()" [attr.role]="variant() === 'error' ? 'alert' : 'status'">
        {{ message() }}
      </p>
    }
  `,
  styles: `
    .feedback { margin: 0; padding: 12px 14px; border: 1px solid; border-radius: .75rem; font-size: 14px; font-weight: 600; line-height: 1.5; }
    .error { color: #be123c; background: #fff1f2; border-color: #fecdd3; }
    .success { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
    .info { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
  `,
})
export class FeedbackMessageComponent {
  readonly message = input<string | null>(null);
  readonly variant = input<'error' | 'success' | 'info'>('error');
}