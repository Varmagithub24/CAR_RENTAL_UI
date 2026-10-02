import { Injectable, signal } from '@angular/core';
import { BookingResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReservationContextService {
  readonly currentBooking = signal<BookingResponse | null>(null);

  setCurrentBooking(booking: BookingResponse): void {
    this.currentBooking.set(booking);
  }

  updateCurrentBooking(booking: BookingResponse): void {
    if (this.currentBooking()?.bookingId === booking.bookingId) {
      this.currentBooking.set(booking);
    }
  }
}