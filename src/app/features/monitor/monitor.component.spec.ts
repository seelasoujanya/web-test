import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorComponent } from './monitor.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInstancesByStatus',
      'getPausedProperty',
      'updateWorkflowInstanceStatus',
    ]);

    const mockPage: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 10,
      number: 0,
      totalPages: 1,
      numberOfElements: 0,
    };

    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockPage));

    apiServiceSpy.getPausedProperty.and.returnValue(
      of({ key: 'paused', value: 'false' })
    );

    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);

    const webSocketAPISpy = jasmine.createSpyObj('WebSocketAPI', [
      'getProcessProgress',
    ]);

    await TestBed.configureTestingModule({
      imports: [MonitorComponent, HttpClientModule],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;

    spyOn(console, 'log');
    spyOn(console, 'error');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle expandedId correctly when expandAction is called', () => {
    const instance = { id: 1 };
    component.expandAction(instance);
    expect(component.expandedId).toBe(1);

    component.expandAction(instance);
    expect(component.expandedId).toBeUndefined();

    const anotherInstance = { id: 2 };
    component.expandAction(anotherInstance);
    expect(component.expandedId).toBe(2);
  });
});
