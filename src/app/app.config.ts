import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthService } from './services/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => {
    return new Promise<void>((resolve) => {
      console.log('APP_INITIALIZER: Initialisation auth...');
      authService.checkAuth();

      // Attendre que l'initialisation soit terminée
      const checkInit = () => {
        if (authService.isInitialized()) {
          console.log(
            'APP_INITIALIZER: Auth initialisé, isAuthenticated =',
            authService.isAuthenticated()
          );
          resolve();
        } else {
          setTimeout(checkInit, 10);
        }
      };
      checkInit();
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
