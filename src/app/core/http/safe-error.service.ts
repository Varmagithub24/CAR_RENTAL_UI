import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SafeErrorService {
  message(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }

    if (error.error?.code === 'EMAIL_VERIFICATION_REQUIRED') return 'Verify your email before signing in. Request a verification email below.';
    if (error.error?.code === 'INVALID_VERIFICATION_TOKEN') return 'This verification link is invalid or expired. Request a new link.';
    if (error.error?.code === 'VERIFICATION_DELIVERY_FAILED') return 'Your verification email could not be sent. Request a new email when delivery is available.';

    if (error.status === 0) return 'We could not reach the service. Check your connection and try again.';
    if (error.status === 400) return 'Some details could not be accepted. Review the form and try again.';
    if (error.status === 401) return 'Your session has expired. Sign in to continue.';
    if (error.status === 403) return 'You do not have permission to do that.';
    if (error.status === 404) return 'We could not find that item.';
    if (error.status === 409) return 'That request conflicts with a recent change. Refresh and try again.';
    if (error.status === 423) return 'This account is temporarily locked. Try again later.';
    if (error.status >= 500) return 'Our service is having trouble. Please try again shortly.';
    return 'Something went wrong. Please try again.';
  }
}