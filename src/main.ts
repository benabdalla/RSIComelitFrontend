// Polyfill for 'global' in browser environments
(window as any).global = window;

/// <reference types="@angular/localize" />
import '@angular/localize/init';

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {importProvidersFrom} from '@angular/core';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {authInterceptor} from './app/shared/interceptor/auth-interceptor.service';
// ...other module imports...

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatProgressSpinnerModule,
      // ...other modules...
      ToastrModule.forRoot({
        positionClass: 'toast-top-center',
        timeOut: 3000,
        preventDuplicates: true
      })
    ),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch() // <-- Enable Fetch API support
    )
  ]
}).catch(err => console.error(err));
