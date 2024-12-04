import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/main/app.config';
import { AppComponent } from './app/main/app.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideCharts(withDefaultRegisterables()),
    ...appConfig.providers,
    provideAnimations(),
    provideToastr({
      timeOut: 1000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
  ],
}).catch(err => console.error(err));
