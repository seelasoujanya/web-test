import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/main/app.config';
import { AppComponent } from './app/main/app.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideCharts(withDefaultRegisterables()),
    ...appConfig.providers,
  ],
}).catch(err => console.error(err));
