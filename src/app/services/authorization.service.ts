import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { lastValueFrom, takeUntil } from 'rxjs';

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

  async getAuthenticatedUser() {
    if (this.userData === null) {
      try {
        this.userData = await lastValueFrom(this.userApi.getUserDetails());
      } catch (error) {
        console.error('Error fetching user details', error);
      }
    }
    return this.userData;
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
