import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimeFormatService } from './time-format.service';

describe('TimeFormatService', () => {
  let service: TimeFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially be in Local time format', fakeAsync(() => {
    let currentFormat: string | undefined;

    service.isUTC$.subscribe(isUTC => {
      currentFormat = isUTC ? 'UTC' : 'Local';
    });

    tick();

    expect(currentFormat).toBe('Local');
  }));

  it('should toggle between Local and UTC time formats', fakeAsync(() => {
    let currentFormat: string | undefined;

    service.isUTC$.subscribe(isUTC => {
      currentFormat = isUTC ? 'UTC' : 'Local';
    });

    tick();
    expect(currentFormat).toBe('Local');

    service.toggleTimeFormat();
    tick();
    expect(currentFormat).toBe('UTC');

    service.toggleTimeFormat();
    tick();
    expect(currentFormat).toBe('Local');
  }));

  it('should return correct time format with getCurrentTimeFormat', () => {
    expect(service.getCurrentTimeFormat()).toBe('Local');

    service.toggleTimeFormat();
    expect(service.getCurrentTimeFormat()).toBe('UTC');

    service.toggleTimeFormat();
    expect(service.getCurrentTimeFormat()).toBe('Local');
  });
});
