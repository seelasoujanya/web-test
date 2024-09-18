import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService implements OnInit {
  private userDataPromise: Promise<any> | null = null;
  private userData: any = null;

  constructor(
    private http: HttpClient,
    private userApi: ApiService
  ) {}

  ngOnInit(): void {
    this.getAuthenticatedUser();
  }

  public async isAuthenticated(): Promise<boolean> {
    await this.getAuthenticatedUser();
    return this.userData != null;
  }

  async getAuthenticatedUser(): Promise<any> {
    if (this.userDataPromise) {
      return this.userDataPromise;
    }

    if (!this.userData) {
      this.userDataPromise = lastValueFrom(this.userApi.getUserDetails())
        .then(data => {
          this.userData = data;
          this.userDataPromise = null;
          return this.userData;
        })
        .catch(error => {
          this.userDataPromise = null;
          console.error('Error fetching user details', error);
          throw error;
        });

      return this.userDataPromise;
    }

    return this.userData;
  }

  async getCsrfToken(): Promise<string> {
    const userData = await this.getAuthenticatedUser();
    return userData.principal.tokenValue;
  }

  getUserData(): any {
    return this.userData;
  }

  async getBGroupId(): Promise<string> {
    const userData = await this.getAuthenticatedUser();
    return userData.principal.claims.profile.BGroupId;
  }
}
