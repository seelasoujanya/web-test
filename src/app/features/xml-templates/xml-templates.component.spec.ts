import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlTemplatesComponent } from './xml-templates.component';
import { HttpClientModule } from '@angular/common/http';

describe('XmlTemplatesComponent', () => {
  let component: XmlTemplatesComponent;
  let fixture: ComponentFixture<XmlTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlTemplatesComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
