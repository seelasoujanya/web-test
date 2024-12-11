import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../core/services/api.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiService],
})
export class AppComponent implements OnInit {
  title = 'Deliver Test';
  userDetails: any;

  constructor(
    private authorizationService: AuthorizationService,
    private titleService: Title
  ) {}

  async ngOnInit(): Promise<void> {
    this.userDetails = this.authorizationService.getUserData();
    this.titleService.setTitle(environment.title);
  }
}
