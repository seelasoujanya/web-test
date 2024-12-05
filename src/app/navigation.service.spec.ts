import { TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { of } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

describe('NavigationService', () => {
  let service: NavigationService;
  let routerMock: { events: any };
  let navigateSpy: jasmine.Spy;

  beforeEach(() => {
    routerMock = {
      events: of(new NavigationEnd(1, '/home', '/home')), // Mock a successful navigation
    };

    TestBed.configureTestingModule({
      providers: [NavigationService, { provide: Router, useValue: routerMock }],
    });
    service = TestBed.inject(NavigationService);
    navigateSpy = spyOn(routerMock as any, 'navigateByUrl');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should go back to the previous route', () => {
    service['history'] = ['/home', '/about'];

    service.goBack();

    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('should go to the default route when no history is present', () => {
    service['history'] = [];

    service.goBack('/default');
    expect(navigateSpy).toHaveBeenCalledWith('/default');
  });

  it('should clear the history', () => {
    service['history'] = ['/home', '/about'];
    service.clearHistory();
    expect(service.getHistory()).toEqual([]);
  });
});
