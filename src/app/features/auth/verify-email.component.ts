import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FeedbackMessageComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './auth-pages.component.scss',
})
export class VerifyEmailComponent {
  private readonly auth = inject(AuthService);
  private readonly errors = inject(SafeErrorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);
  private readonly token = new URLSearchParams(this.route.snapshot.fragment ?? '').get('token');

  protected readonly hasToken = signal(Boolean(this.token));
  protected readonly busy = signal(false);
  protected readonly confirmed = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly profile = this.builder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });
  protected readonly request = this.builder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  constructor() {
    if (this.token) {
      void this.router.navigate([], { relativeTo: this.route, replaceUrl: true, fragment: undefined });
    }
  }

  confirm(): void {
    this.profile.markAllAsTouched();
    if (!this.token || this.profile.invalid || this.busy()) return;
    this.busy.set(true);
    this.errorMessage.set(null);
    this.auth.confirmVerification({ token: this.token, ...this.profile.getRawValue() })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.confirmed.set(true);
          this.successMessage.set('Your email is verified. You can now sign in.');
        },
        error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
      });
  }

  resend(): void {
    this.request.markAllAsTouched();
    if (this.request.invalid || this.busy()) return;
    this.busy.set(true);
    this.errorMessage.set(null);
    this.auth.requestVerification(this.request.getRawValue().email)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.successMessage.set('If your account needs verification, check your email for a new link.'),
        error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
      });
  }

  requestNewLink(): void {
    this.hasToken.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}