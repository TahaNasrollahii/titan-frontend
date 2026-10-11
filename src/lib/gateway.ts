import { TOAST_OPEN_MS } from '@/components/ToastContainer';
import type { Toast } from '@/context/AppContext';
import { API_URL } from '@/lib/api/client';

/**
 * Send the browser to a payment gateway. The redirect reloads the page and wipes any toast,
 * so announce it first and give the toast time to open.
 */
export async function redirectToGateway(url: string, addToast: (toast: Omit<Toast, 'id'>) => void) {
  // If the backend returned a fake test gateway URL, redirect through the active API callback
  if (url.includes('Authority=FAKE-') || url.includes('titan-back.vercel.app')) {
    try {
      const parsed = new URL(url);
      const authority = parsed.searchParams.get('Authority');
      const status = parsed.searchParams.get('Status') ?? 'OK';
      if (authority) {
        window.location.assign(
          `${API_URL}/payments/callback/?Authority=${encodeURIComponent(authority)}&Status=${encodeURIComponent(status)}`
        );
        return;
      }
    } catch {
      // Fall through to regular redirect
    }
  }

  addToast({ title: 'در حال انتقال...', text: 'در حال انتقال به درگاه پرداخت', icon: 'cart', tone: 'info' });
  await new Promise(resolve => window.setTimeout(resolve, TOAST_OPEN_MS));
  window.location.assign(url);
}
