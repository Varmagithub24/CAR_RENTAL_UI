import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RentalApiService } from '../../core/services/rental-api.service';
import { Address, KycRecord, UserProfile } from '../../core/models/api.models';
import { SafeErrorService } from '../../core/http/safe-error.service';
import { FeedbackMessageComponent } from '../../shared/components/feedback-message.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FeedbackMessageComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(RentalApiService);
  private readonly errors = inject(SafeErrorService);

  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly addresses = signal<Address[]>([]);
  protected readonly kyc = signal<KycRecord | null>(null);
  protected readonly profileError = signal<string | null>(null);
  protected readonly addressError = signal<string | null>(null);
  protected readonly kycError = signal<string | null>(null);
  protected readonly profileNotice = signal<string | null>(null);
  protected readonly addressNotice = signal<string | null>(null);
  protected readonly kycNotice = signal<string | null>(null);
  protected readonly profileBusy = signal(false);
  protected readonly addressBusy = signal(false);
  protected readonly kycBusy = signal(false);
  protected readonly maxDateOfBirth = new Date().toISOString().slice(0, 10);

  protected get initials(): string {
    const current = this.profile();
    const first = current?.firstName?.trim().charAt(0) ?? '';
    const last = current?.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toLocaleUpperCase() || 'U';
  }

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.maxLength(30)]],
    dateOfBirth: [''],
    preferredLanguage: ['en', Validators.maxLength(10)],
  });

  protected readonly addressForm = this.formBuilder.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(50)]],
    line1: ['', [Validators.required, Validators.maxLength(180)]],
    line2: ['', Validators.maxLength(180)],
    city: ['', [Validators.required, Validators.maxLength(80)]],
    state: ['', Validators.maxLength(80)],
    postalCode: ['', [Validators.required, Validators.maxLength(20)]],
    country: ['', [Validators.required, Validators.maxLength(80)]],
    isPrimary: [false],
  });

  protected readonly kycForm = this.formBuilder.nonNullable.group({
    documentType: ['', Validators.required],
    fileName: ['', [Validators.required, Validators.maxLength(180)]],
    sizeBytes: ['', [Validators.required, Validators.min(51_200), Validators.max(10_485_760)]],
    licenseNumber: ['', [Validators.required, Validators.maxLength(80)]],
    issuer: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    this.loadProfile();
    this.loadAddresses();
    this.loadKyc();
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.profileBusy()) return;
    this.profileBusy.set(true);
    this.profileError.set(null);
    this.profileNotice.set(null);
    const formValue = this.profileForm.getRawValue();
    this.api.updateProfile({ ...formValue, dateOfBirth: formValue.dateOfBirth || null }).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({ dateOfBirth: profile.dateOfBirth ?? '' });
        this.profileNotice.set('Your profile has been updated.');
      },
      error: (error: unknown) => this.profileError.set(this.errors.message(error)),
      complete: () => this.profileBusy.set(false),
    });
  }

  addAddress(): void {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid || this.addressBusy()) return;
    this.addressBusy.set(true);
    this.addressError.set(null);
    this.addressNotice.set(null);
    this.api.addAddress(this.addressForm.getRawValue()).subscribe({
      next: () => {
        this.addressNotice.set('Address added.');
        this.addressForm.reset({ label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isPrimary: false });
        this.loadAddresses();
      },
      error: (error: unknown) => this.addressError.set(this.errors.message(error)),
      complete: () => this.addressBusy.set(false),
    });
  }

  submitKyc(): void {
    this.kycForm.markAllAsTouched();
    if (this.kycForm.invalid || this.kycBusy()) return;
    this.kycBusy.set(true);
    this.kycError.set(null);
    this.kycNotice.set(null);
    const formValue = this.kycForm.getRawValue();
    this.api.submitKyc({ ...formValue, sizeBytes: Number(formValue.sizeBytes) }).subscribe({
      next: (record) => {
        this.kyc.set(record);
        this.kycNotice.set('Your licence details have been submitted for review.');
      },
      error: (error: unknown) => this.kycError.set(this.errors.message(error)),
      complete: () => this.kycBusy.set(false),
    });
  }

  private loadProfile(): void {
    this.api.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          ...profile,
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          dateOfBirth: profile.dateOfBirth ?? '',
        });
      },
      error: (error: unknown) => this.profileError.set(this.errors.message(error)),
    });
  }

  private loadAddresses(): void {
    this.api.getAddresses().subscribe({
      next: (addresses) => this.addresses.set(addresses),
      error: (error: unknown) => this.addressError.set(this.errors.message(error)),
    });
  }

  private loadKyc(): void {
    this.api.getKycStatus().subscribe({
      next: (record) => this.kyc.set(record),
      error: (error: unknown) => this.kycError.set(this.errors.message(error)),
    });
  }
}
