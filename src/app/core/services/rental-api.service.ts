import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Address,
  AvailabilityResponse,
  BookingRequest,
  BookingResponse,
  HoldRequest,
  HoldResponse,
  KycRecord,
  KycSubmissionRequest,
  QuoteRequest,
  QuoteResponse,
  UserProfile,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RentalApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/me`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/users/me`, profile);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}/users/me/addresses`);
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(`${this.baseUrl}/users/me/addresses`, address);
  }

  getKycStatus(): Observable<KycRecord> {
    return this.http.get<KycRecord>(`${this.baseUrl}/kyc/status`);
  }

  submitKyc(request: KycSubmissionRequest): Observable<KycRecord> {
    return this.http.post<KycRecord>(`${this.baseUrl}/kyc`, request);
  }

  getAvailability(locationId: string, startTime: string, endTime: string): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('locationId', locationId)
      .set('startTime', startTime)
      .set('endTime', endTime);
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability`, { params });
  }

  quote(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${this.baseUrl}/prices/quote`, request);
  }

  createHold(request: HoldRequest): Observable<HoldResponse> {
    return this.http.post<HoldResponse>(`${this.baseUrl}/holds`, request);
  }

  lockPrice(holdId: string, locationId: string, vehicleCategory: string, currency: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/prices/lock`, { holdId, locationId, vehicleCategory, currency });
  }

  releaseHold(holdId: string): Observable<HoldResponse> {
    return this.http.delete<HoldResponse>(`${this.baseUrl}/holds/${encodeURIComponent(holdId)}`);
  }

  getHold(holdId: string): Observable<HoldResponse> {
    return this.http.get<HoldResponse>(`${this.baseUrl}/holds/${encodeURIComponent(holdId)}`);
  }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings`, request);
  }

  confirmBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}/confirm`, {});
  }

  cancelBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}/cancel`, {});
  }
}