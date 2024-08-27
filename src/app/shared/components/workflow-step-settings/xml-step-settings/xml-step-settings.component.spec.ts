import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlStepSettingsComponent } from './xml-step-settings.component';
import { HttpClientModule } from '@angular/common/http';

describe('XmlStepSettingsComponent', () => {
  let component: XmlStepSettingsComponent;
  let fixture: ComponentFixture<XmlStepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlStepSettingsComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlStepSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
