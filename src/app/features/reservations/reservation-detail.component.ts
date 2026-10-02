import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RentalApiService } from '../../core/services/rental-api.service';
import { ReservationContextService } from '../../core/services/reservation-context.service';
import { BookingResponse } from '../../core/models/api.models';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, FeedbackMessageComponent],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent {
  private readonly api = inject(RentalApiService);
  private readonly context = inject(ReservationContextService);
  private readonly errors = inject(SafeErrorService);

  protected readonly booking = signal<BookingResponse | null>(this.context.currentBooking());
  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  confirm(): void {
    this.updateBooking((bookingId) => this.api.confirmBooking(bookingId));
  }

  cancel(): void {
    this.updateBooking((bookingId) => this.api.cancelBooking(bookingId));
  }

  private updateBooking(action: (bookingId: string) => Observable<BookingResponse>): void {
    const bookingId = this.booking()?.bookingId;
    if (!bookingId || this.busy()) return;
    this.busy.set(true);
    this.errorMessage.set(null);
    this.notice.set(null);
    action(bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.context.updateCurrentBooking(booking);
        this.notice.set(booking.status === 'CONFIRMED' ? 'Your reservation is confirmed.' : 'Your reservation has been cancelled.');
      },
      error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
      complete: () => this.busy.set(false),
    });
  }
}