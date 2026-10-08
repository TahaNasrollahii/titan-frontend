import { TOAST_OPEN_MS } from '@/components/ToastContainer';
import type { Toast } from '@/context/AppContext';

/**
 * Send the browser to a payment gateway. The redirect reloads the page and wipes any toast,
 * so announce it first and give the toast time to open.
 */
export async function redirectToGateway(url: string, addToast: (toast: Omit<Toast, 'id'>) => void) {
  addToast({ title: 'در حال انتقال...', text: 'در حال انتقال به درگاه پرداخت', icon: 'cart', tone: 'info' });
  await new Promise(resolve => window.setTimeout(resolve, TOAST_OPEN_MS));
  window.location.assign(url);
}
