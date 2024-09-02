import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 3661 seconds to "01:01:01"', () => {
    expect(pipe.transform(3661)).toBe('01:01:01');
  });

  it('should transform 3600 seconds to "01:00:00"', () => {
    expect(pipe.transform(3600)).toBe('01:00:00');
  });

  it('should transform 59 seconds to "00:00:59"', () => {
    expect(pipe.transform(59)).toBe('00:00:59');
  });

  it('should transform 0 seconds to "00:00:00"', () => {
    expect(pipe.transform(0)).toBe('00:00:00');
  });

  it('should transform undefined to "00:00:00"', () => {
    expect(pipe.transform(undefined as any)).toBe('00:00:00');
  });

  it('should transform null to "00:00:00"', () => {
    expect(pipe.transform(null as any)).toBe('00:00:00');
  });
});
