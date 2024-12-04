import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModalComponent } from './confirm-modal.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let bsModalRefSpy: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    bsModalRefSpy = jasmine.createSpyObj('BsModalRef', ['hide']);

    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
      providers: [{ provide: BsModalRef, useValue: bsModalRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit templateDescription when enableComments is true', () => {
    component.enableComments = true;
    spyOn(component.updateChanges, 'emit');
    component.templateDescription = 'Some Description';

    component.confirmModal();

    expect(component.updateChanges.emit).toHaveBeenCalledWith(
      'Some Description'
    );
  });

  it('should emit true when enableComments is false', () => {
    component.enableComments = false;
    spyOn(component.updateChanges, 'emit');

    component.confirmModal();

    expect(component.updateChanges.emit).toHaveBeenCalledWith(true);
  });

  it('should emit false on cancel', () => {
    spyOn(component.updateChanges, 'emit');

    component.cancelModal();

    expect(component.updateChanges.emit).toHaveBeenCalledWith(false);
  });

  it('should call bsModalRef.hide() on closeModal', () => {
    component.closeModal();

    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });

  it('should call bsModalRef.hide() on cancelModal', () => {
    component.cancelModal();

    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });

  it('should call bsModalRef.hide() on confirmModal', () => {
    component.confirmModal();

    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });
});
