import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInfoComponent } from './account-info.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';

describe('AccountInfoComponent', () => {
  let component: AccountInfoComponent;
  let fixture: ComponentFixture<AccountInfoComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;
  let bsModalRef: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getUserDetails',
    ]);
    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);
    const bsModalRefSpy = jasmine.createSpyObj('BsModalRef', ['hide']);

    await TestBed.configureTestingModule({
      imports: [AccountInfoComponent, CommonModule, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
        { provide: BsModalRef, useValue: bsModalRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountInfoComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spinnerService = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;
    bsModalRef = TestBed.inject(BsModalRef) as jasmine.SpyObj<BsModalRef>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call bsModalRef.hide when closeModal is called', () => {
    component.closeModal(true);
    expect(bsModalRef.hide).toHaveBeenCalled();
  });

  it('should show spinner and call getAccountInfo on ngOnInit', () => {
    spyOn(component, 'getAccountInfo');
    component.ngOnInit();
    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.getAccountInfo).toHaveBeenCalled();
  });

  it('should calculate tabContentHeight correctly', () => {
    const expectedHeight = window.innerHeight - 220;
    expect(component.tabContentHeight).toBe(expectedHeight);
  });
});
