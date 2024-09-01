import { TestBed } from '@angular/core/testing';

import { AuthorizationService } from './authorization.service';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let httpTestingController: HttpTestingController;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockUserDetails = {
    principal: {
      idToken: {
        tokenValue: 'mockCsrfToken',
      },
    },
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getUserDetails']);
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        AuthorizationService,
        { provide: ApiService, useValue: mockApiService },
      ],
    });
    service = TestBed.inject(AuthorizationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get authenticated user details', async () => {
    mockApiService.getUserDetails.and.returnValue(of(mockUserDetails));
    await service.getAuthenticatedUser();
    expect(service.getUserData()).toEqual(mockUserDetails);
  });

  it('should return true for isAuthenticated if user data is present', async () => {
    mockApiService.getUserDetails.and.returnValue(of(mockUserDetails));
    const isAuthenticated = await service.isAuthenticated();
    expect(isAuthenticated).toBeTrue();
  });

  it('should return false for isAuthenticated if user data is null', async () => {
    mockApiService.getUserDetails.and.returnValue(
      throwError(() => new Error('Error'))
    );
    const isAuthenticated = await service.isAuthenticated();
    expect(isAuthenticated).toBeFalse();
  });

  it('should get CSRF token from user data', async () => {
    mockApiService.getUserDetails.and.returnValue(of(mockUserDetails));
    const token = await service.getCsrfToken();
    expect(token).toBe('mockCsrfToken');
  });

  it('should handle errors when fetching user details', async () => {
    mockApiService.getUserDetails.and.returnValue(
      throwError(() => new Error('Error'))
    );
    try {
      await service.getAuthenticatedUser();
    } catch (error) {
      // Expect console.error to be called with the error
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching user details',
        error
      );
    }
  });

  it('should return user data without calling getAuthenticatedUser if user data is already fetched', async () => {
    (service as any).userData = mockUserDetails;

    const userData = service.getUserData();

    expect(userData).toEqual(mockUserDetails);
  });

  it('should handle errors in getAuthenticatedUser', async () => {
    spyOn(console, 'error'); // Spy on console.error
    mockApiService.getUserDetails.and.returnValue(
      throwError(() => new Error('Fetch error'))
    );

    const userData = await service.getAuthenticatedUser();

    expect(userData).toBeNull();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user details',
      jasmine.any(Error)
    );
  });

  it('should fetch user data before getting CSRF token if user data is null', async () => {
    mockApiService.getUserDetails.and.returnValue(of(mockUserDetails));

    const token = await service.getCsrfToken();

    expect(token).toBe('mockCsrfToken');

    expect(mockApiService.getUserDetails).toHaveBeenCalled();
  });

  it('should call getAuthenticatedUser in ngOnInit', async () => {
    spyOn(service, 'getAuthenticatedUser');

    service.ngOnInit();

    expect(service.getAuthenticatedUser).toHaveBeenCalled();
  });
});
