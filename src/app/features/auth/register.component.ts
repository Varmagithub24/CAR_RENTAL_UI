import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FeedbackMessageComponent],
  templateUrl: './register.component.html',
  styleUrl: './auth-pages.component.scss',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errors = inject(SafeErrorService);

  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(6), Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    const { email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    this.busy.set(true);
    this.errorMessage.set(null);
    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.successMessage.set('Your account is ready. Sign in to continue.');
        this.form.reset();
      },
      error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
      complete: () => this.busy.set(false),
    });
  }

  goToSignIn(): void {
    void this.router.navigateByUrl('/sign-in');
  }
}