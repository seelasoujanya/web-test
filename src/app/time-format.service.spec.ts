import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimeFormatService } from './time-format.service';
import * as moment from 'moment';

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
    const mockLocalTime = 'Nov 28, 2024 22:41:31';
    const mockUTCTime = 'Nov 28, 2024 17:11:31';

    spyOn(moment, 'tz').and.returnValue(
      moment(mockLocalTime, 'MMM DD, YYYY HH:mm:ss')
    );
    spyOn(moment, 'utc').and.returnValue(
      moment(mockUTCTime, 'MMM DD, YYYY HH:mm:ss')
    );

    expect(service.getCurrentTime()).toBe(mockLocalTime);

    service.toggleTimeFormat();
    expect(service.getCurrentTime()).toBe(mockUTCTime);

    service.toggleTimeFormat();
    expect(service.getCurrentTime()).toBe(mockLocalTime);
  });
});
