import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../core/services/api.service';
import { AuthorizationService } from '../core/services/authorization.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiService],
})
export class AppComponent {
  title = 'Deliver Test';
  userDetails: any;

  constructor(private authorizationService: AuthorizationService) {}

  async ngOnInit(): Promise<void> {
    const authenticated = await this.authorizationService.isAuthenticated();
    this.userDetails = this.authorizationService.getUserData();
  }
}
