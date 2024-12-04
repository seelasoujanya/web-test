import { TestBed } from '@angular/core/testing';

import { PausedPropertyService } from './paused-property.service';

describe('PausedPropertyService', () => {
  let service: PausedPropertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PausedPropertyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
