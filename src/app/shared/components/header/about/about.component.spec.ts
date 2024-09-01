import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let bsModalRefSpy: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    bsModalRefSpy = jasmine.createSpyObj('BsModalRef', ['hide']);
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [{ provide: BsModalRef, useValue: bsModalRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.changeLogs).toEqual([]);
    expect(component.currentVersion).toBeNull();
    expect(component.dataloaded).toBeFalse();
  });

  it('should call bsModalRef.hide() on closeModal', () => {
    component.closeModal(true);
    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });

  it('should call bsModalRef.hide() on closeModal with false parameter', () => {
    component.closeModal(false);
    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });
});
