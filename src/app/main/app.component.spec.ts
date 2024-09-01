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

  it('should check authentication and set userDetails if authenticated', waitForAsync(async () => {
    authorizationServiceSpy.isAuthenticated.and.returnValue(
      Promise.resolve(true)
    );
    authorizationServiceSpy.getUserData.and.returnValue({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    await app.ngOnInit();

    expect(authorizationServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(app.userDetails).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
  }));
});
