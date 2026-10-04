import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { RentalApiService } from '../core/services/rental-api.service';
import { UserProfile } from '../core/models/api.models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(RentalApiService);
  private readonly router = inject(Router);
  protected readonly profile = signal<UserProfile | null>(null);

  constructor() {
    this.api.getProfile().subscribe({ next: (profile) => this.profile.set(profile) });
  }

  protected get initials(): string {
    const profile = this.profile();
    const first = profile?.firstName?.trim().charAt(0) ?? '';
    const last = profile?.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toLocaleUpperCase() || 'U';
  }

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/sign-in');
  }
}
