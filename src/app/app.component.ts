import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'my-app';
  // user: any;

  // constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  // checkAuthentication(): void {
  //   this.apiService.getUserDetails().subscribe({
  //     next: result => {
  //       this.user = result;
  //     },
  //     error: err => {
  //       console.error('Error occurred while fetching user info: ', err);
  //     },
  //   });
  // }
}
