import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpUploaderSettingsComponent } from './ftp-uploader-settings.component';

describe('FtpUploaderSettingsComponent', () => {
  let component: FtpUploaderSettingsComponent;
  let fixture: ComponentFixture<FtpUploaderSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FtpUploaderSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FtpUploaderSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
