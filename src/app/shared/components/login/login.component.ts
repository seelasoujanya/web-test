// ANGULAR
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  standalone: true,
  selector: 'bmg-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginUrl: string | undefined;

  constructor() {}

  public ngOnInit(): void {
    // this.authorizationService.handleAuthentication();
    this.loginUrl =
      `${environment.BE_URL}/oauth2/authorization/okta` ||
      window.location.origin;
  }

  public login() {
    window.location.href =
      `${environment.BE_URL}/oauth2/authorization/okta` ||
      window.location.origin;
  }
}
