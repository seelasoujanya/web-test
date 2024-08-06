import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-detail-view.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('WorkflowDetailViewComponent', () => {
  let component: WorkflowDetailViewComponent;
  let fixture: ComponentFixture<WorkflowDetailViewComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let cdRef: ChangeDetectorRef;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowInstanceDetails',
    ]);
    cdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailViewComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // const mockData = {workfow: {name: 'test', id: 1, duration: '2024-09-01T00:00:00Z', status: 'success', completed: '2024-09-01T00:00:00Z'}};
    // apiService.getWorkflowInstanceDetails.and.returnValue(of(mockData))

    expect(component).toBeTruthy();
  });
});
