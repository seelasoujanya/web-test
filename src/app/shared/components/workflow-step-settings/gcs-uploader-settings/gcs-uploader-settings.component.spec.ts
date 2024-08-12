import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GcsUploaderSettingsComponent } from './gcs-uploader-settings.component';

describe('GcsUploaderSettingsComponent', () => {
  let component: GcsUploaderSettingsComponent;
  let fixture: ComponentFixture<GcsUploaderSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GcsUploaderSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GcsUploaderSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
