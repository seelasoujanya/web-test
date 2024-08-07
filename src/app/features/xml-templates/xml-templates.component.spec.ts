import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlTemplatesComponent } from './xml-templates.component';

describe('XmlTemplatesComponent', () => {
  let component: XmlTemplatesComponent;
  let fixture: ComponentFixture<XmlTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlTemplatesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset new template data', () => {
    component.reset();
    expect(component.newTemplateData.name).toBe('');
  });
});
