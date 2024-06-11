import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, InfiniteScrollModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiService],
})
export class AppComponent {
  title = 'Deliver Test';
  userDetails: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    });
  }
}
