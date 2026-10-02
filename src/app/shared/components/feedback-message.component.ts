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
    .feedback { margin: 0; padding: 12px 14px; border: 1px solid; border-radius: 6px; font-size: 14px; line-height: 1.5; }
    .error { color: #8c2f25; background: #fff1ec; border-color: #f1c0b3; }
    .success { color: #235a43; background: #edf7f0; border-color: #bad8c3; }
    .info { color: #36514a; background: #eef3ed; border-color: #d3dfd4; }
  `,
})
export class FeedbackMessageComponent {
  readonly message = input<string | null>(null);
  readonly variant = input<'error' | 'success' | 'info'>('error');
}