import { Resend } from 'resend';

let _resend: Resend | null = null;

/**
 * Lazy-initialised Resend client.
 * We avoid a top-level guard so that `next build` doesn't crash when
 * RESEND_API_KEY isn't in the build environment (it's a server-only secret).
 */
export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** @deprecated Use getResend() — kept temporarily for backwards compat */
export const resend = undefined as unknown as Resend;

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'AccessAudit <notifications@accessaudit.com>';

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://accessaudit.com';
