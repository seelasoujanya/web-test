import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthorizationService } from '../core/services/authorization.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('AppComponent', () => {
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthorizationService', [
      'isAuthenticated',
      'getUserData',
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientModule, RouterModule.forRoot([])],
      providers: [{ provide: AuthorizationService, useValue: authSpy }],
    }).compileComponents();

    authorizationServiceSpy = TestBed.inject(
      AuthorizationService
    ) as jasmine.SpyObj<AuthorizationService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
