import { HttpErrorResponse } from '@angular/common/http';
import { SafeErrorService } from './safe-error.service';

describe('SafeErrorService', () => {
  const service = new SafeErrorService();

  it('never displays raw server details for internal errors', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { message: 'Database host db.internal failed at C:\\private\\stack.trace' },
    });

    expect(service.message(error)).toBe('Our service is having trouble. Please try again shortly.');
  });

  it('maps authorization and missing-resource responses to safe messages', () => {
    expect(service.message(new HttpErrorResponse({ status: 403, error: 'private policy detail' })))
      .toBe('You do not have permission to do that.');
    expect(service.message(new HttpErrorResponse({ status: 404, error: 'database row key' })))
      .toBe('We could not find that item.');
  });
});