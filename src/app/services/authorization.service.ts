import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService implements OnInit {
  constructor(
    private http: HttpClient,
    private userApi: ApiService
  ) {}

  private userData: any = null;

  ngOnInit(): void {
    this.getAuthenticatedUser();
  }

  public async isAuthenticated(): Promise<boolean> {
    await this.getAuthenticatedUser();
    return this.userData != null;
  }

  async getAuthenticatedUser(): Promise<any> {
    if (this.userData === null) {
      this.userData = 'loading';
      const user = await this.userApi.getUserDetails().toPromise();
      this.userData = user;
      return this.userData;
    } else if (this.userData === 'loading') {
      setTimeout(() => {
        return this.getAuthenticatedUser();
      }, 50);
    }
  }

  async getCsrfToken(): Promise<string> {
    await this.getAuthenticatedUser();

    return this.userData.principal.idToken.tokenValue;
  }

  getUserData(): any {
    this.getAuthenticatedUser();

    return this.userData;
  }
}
