import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorComponent } from './monitor.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { of } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getInstancesByStatus']);
    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);

    const webSocketAPISpy = jasmine.createSpyObj('WebSocketAPI', [
      'getProcessProgress',
    ]);

    await TestBed.configureTestingModule({
      imports: [MonitorComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return default page parameters', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({
      page: 0,
      pageSize: 10,
      status: 'RUNNING',
    });
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
