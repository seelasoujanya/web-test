import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateVersionDetailsComponent } from './template-version-details.component';

describe('TemplateVersionDetailsComponent', () => {
  let component: TemplateVersionDetailsComponent;
  let fixture: ComponentFixture<TemplateVersionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateVersionDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateVersionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
