import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlStepSettingsComponent } from './xml-step-settings.component';

describe('XmlStepSettingsComponent', () => {
  let component: XmlStepSettingsComponent;
  let fixture: ComponentFixture<XmlStepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlStepSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlStepSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
