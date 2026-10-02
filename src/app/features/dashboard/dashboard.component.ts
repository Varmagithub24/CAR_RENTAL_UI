import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RentalApiService } from '../../core/services/rental-api.service';
import { UserProfile } from '../../core/models/api.models';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FeedbackMessageComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly api = inject(RentalApiService);
  private readonly errors = inject(SafeErrorService);

  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.api.getProfile().subscribe({
      next: (profile) => this.profile.set(profile),
      error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
    });
  }

  protected get firstName(): string {
    return this.profile()?.firstName || 'there';
  }
}