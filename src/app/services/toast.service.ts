import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toast, Toaster } from 'sonner';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  success(message: string, description?: string) {
    if (this.isBrowser) {
      toast.success(message, { description });
    }
  }

  error(message: string, description?: string) {
    if (this.isBrowser) {
      toast.error(message, { description });
    }
  }

  warning(message: string, description?: string) {
    if (this.isBrowser) {
      toast.warning(message, { description });
    }
  }

  info(message: string, description?: string) {
    if (this.isBrowser) {
      toast.info(message, { description });
    }
  }

  loading(message: string) {
    if (this.isBrowser) {
      return toast.loading(message);
    }
    return null;
  }

  dismiss(toastId: string | number | null) {
    if (this.isBrowser && toastId) {
      toast.dismiss(toastId);
    }
  }

  promise<T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) {
    if (this.isBrowser) {
      return toast.promise(promise, messages);
    }
    return promise;
  }
}
