import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/core/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DialogComponent } from '../dialog/dialog.component';
import { AboutComponent } from './about/about.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TimeFormatService } from 'src/app/time-format.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let modalService: BsModalService;
  let apiService: ApiService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        DialogComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [BsModalService, ApiService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(BsModalService);
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle selectedMenu on selectMenu', () => {
    component.selectMenu(new Event('click'), 'menu1');
    expect(component.selectedMenu).toBe('menu1');

    component.selectMenu(new Event('click'), 'menu1');
    expect(component.selectedMenu).toBe('');
  });

  it('should show AboutComponent when showAbout is called', () => {
    const templateRef = {} as TemplateRef<any>;
    component.showAbout(templateRef);
    expect(component.modalRef).toBeDefined();
  });

  it('should show AccountInfoComponent when account_info is called', () => {
    component.account_info();
    expect(component.modalRef).toBeDefined();
  });

  it('should call toggleTimeFormat when toggleTimeFormat is called', () => {
    const timeFormatService = TestBed.inject(TimeFormatService);
    spyOn(timeFormatService, 'toggleTimeFormat');

    component.toggleTimeFormat();

    expect(timeFormatService.toggleTimeFormat).toHaveBeenCalled();
  });

  it('should correctly update selectedMenu based on different inputs', () => {
    component.selectMenu(new Event('click'), 'menu1');
    expect(component.selectedMenu).toBe('menu1');

    component.selectMenu(new Event('click'), 'menu2');
    expect(component.selectedMenu).toBe('menu2');

    component.selectMenu(new Event('click'), 'menu2');
    expect(component.selectedMenu).toBe('');
  });
});
