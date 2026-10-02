import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap, throwError } from 'rxjs';
import { RentalApiService } from '../../core/services/rental-api.service';
import { ReservationContextService } from '../../core/services/reservation-context.service';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { AvailabilityResponse, BookingResponse, UserProfile } from '../../core/models/api.models';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';

const locations = [
  { id: 'loc-1', name: 'Central station' },
  { id: 'loc-2', name: 'Airport terminal' },
];

function asLocalDateTime(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return '';
  return Number.isNaN(new Date(value).valueOf()) ? '' : value;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [ReactiveFormsModule, FeedbackMessageComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(RentalApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly errors = inject(SafeErrorService);
  private readonly reservationContext = inject(ReservationContextService);

  protected readonly results = signal<AvailabilityResponse | null>(null);
  protected readonly busy = signal(false);
  protected readonly bookingVehicle = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasSearched = signal(false);
  protected readonly searchFailed = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    locationId: ['loc-1', Validators.required],
    start: ['', Validators.required],
    end: ['', Validators.required],
    vehicleCategory: ['compact', Validators.required],
    currency: ['USD', Validators.required],
  });

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const locationId = params.get('location');
    const start = params.get('start');
    const end = params.get('end');
    const safeStart = asLocalDateTime(start ?? '');
    const safeEnd = asLocalDateTime(end ?? '');
    const validSearch = locations.some((location) => location.id === locationId)
      && !!safeStart && !!safeEnd && new Date(safeEnd) > new Date(safeStart);
    const allowedKeys = new Set(['location', 'start', 'end']);
    const hasUnapprovedQuery = params.keys.some((key) => !allowedKeys.has(key));

    if (validSearch) {
      this.form.patchValue({ locationId: locationId!, start: safeStart, end: safeEnd });
      this.search();
    }
    if (hasUnapprovedQuery || (params.keys.length > 0 && !validSearch)) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: validSearch ? { location: locationId, start: safeStart, end: safeEnd } : {},
        replaceUrl: true,
      });
    }
  }

  search(): void {
    this.form.markAllAsTouched();
    const values = this.form.getRawValue();
    if (this.form.invalid || !locations.some((location) => location.id === values.locationId)
      || !Number.isFinite(Date.parse(values.start)) || !Number.isFinite(Date.parse(values.end))
      || new Date(values.end) <= new Date(values.start)) {
      this.errorMessage.set('Choose a pickup location and a return time after pickup.');
      return;
    }

    this.errorMessage.set(null);
    this.searchFailed.set(false);
    this.results.set(null);
    this.hasSearched.set(true);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { location: values.locationId, start: values.start, end: values.end },
    });
    this.busy.set(true);
    this.api.getAvailability(values.locationId, new Date(values.start).toISOString(), new Date(values.end).toISOString())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (response) => this.results.set(response),
        error: (error: unknown) => {
          this.errorMessage.set(this.errors.message(error));
          this.searchFailed.set(true);
        },
      });
  }

  reserve(vehicleId: string): void {
    if (!this.results() || this.bookingVehicle()) return;
    const values = this.form.getRawValue();
    this.errorMessage.set(null);
    this.bookingVehicle.set(vehicleId);
    const start = new Date(values.start);
    const end = new Date(values.end);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));

    this.api.getProfile().pipe(
      switchMap((profile: UserProfile) => this.api.quote({
        locationId: values.locationId,
        vehicleCategory: values.vehicleCategory,
        currency: values.currency,
        days,
      }).pipe(map((quote) => ({ profile, quote })))),
      switchMap(({ profile, quote }) => this.api.createHold({
        vehicleId,
        customerId: profile.userId,
        locationId: values.locationId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        lockedPrice: quote.finalAmount,
      }).pipe(map((hold) => ({ profile, hold })))),
      switchMap(({ profile, hold }) => this.api.lockPrice(
        hold.holdId,
        values.locationId,
        values.vehicleCategory,
        values.currency,
      ).pipe(
        switchMap(() => this.api.createBooking({
          customerId: profile.userId,
          vehicleId,
          pickupDateTime: values.start,
          returnDateTime: values.end,
        })),
        catchError((error: unknown) => this.api.releaseHold(hold.holdId).pipe(
          catchError(() => of(null)),
          switchMap(() => throwError(() => error)),
        )),
      )),
      finalize(() => this.bookingVehicle.set(null)),
    ).subscribe({
      next: (booking: BookingResponse) => {
        this.reservationContext.setCurrentBooking(booking);
        void this.router.navigateByUrl('/reservations/current');
      },
      error: (error: unknown) => this.errorMessage.set(this.errors.message(error)),
    });
  }
}