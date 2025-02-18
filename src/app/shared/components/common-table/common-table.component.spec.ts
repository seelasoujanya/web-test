import { ToastrModule } from 'ngx-toastr';
import { CommonTableComponent } from './common-table.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

describe('CommonTableComponent', () => {
  let component: CommonTableComponent;
  let fixture: ComponentFixture<CommonTableComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [CommonTableComponent, ToastrModule.forRoot(), HttpClientModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonTableComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the template ID when a valid template ID is present in the row', () => {
    spyOn(component.template, 'emit');

    const mockRow = [null, null, null, null, { id: 123 }];
    component.onRowClick(mockRow);

    expect(component.template.emit).toHaveBeenCalledWith(123);
  });

  it('should not emit anything if template ID is undefined', () => {
    spyOn(component.template, 'emit');

    const mockRow = [null, null, null, null, {}];
    component.onRowClick(mockRow);

    expect(component.template.emit).not.toHaveBeenCalled();
  });

  it('should toggle expandedId correctly', () => {
    component.expandedId = 1;

    component.expandAction(1);
    expect(component.expandedId).toBeUndefined();

    component.expandAction(2);
    expect(component.expandedId).toBe(2);
  });

  it('should emit terminateInstance if status is not QUEUED', () => {
    const row = [1, 'workflowName', 'RUNNING'];

    spyOn(component.terminateInstance, 'emit');

    component.onTerminateInstance(row);

    expect(component.terminateInstance.emit).toHaveBeenCalledWith(1);
  });

  it('should emit editPriority if status is not QUEUED', () => {
    const row = [1, 'workflowName', 'RUNNING'];

    spyOn(component.editPriority, 'emit');

    component.onEditPriority(row);

    expect(component.editPriority.emit).toHaveBeenCalledWith(row);
  });

  it('should emit editPriority if status is not QUEUED', () => {
    const row = [1, 'workflowName', 'RUNNING'];
    spyOn(component.editPriority, 'emit');

    component.onEditPriority(row);

    expect(component.editPriority.emit).toHaveBeenCalledWith(row);
  });

  it('should emit the correct instance ID in navigateToInstance', () => {
    const mockRow = [123];
    spyOn(component.navToInstanceId, 'emit');

    component.navigateToInstance(mockRow);

    expect(component.navToInstanceId.emit).toHaveBeenCalledWith(123);
  });

  it('should emit the correct workflow ID in navigateToWorkflow', () => {
    const mockRow = [456];
    spyOn(component.navToWorkflowId, 'emit');

    component.navigateToWorkflow(mockRow);

    expect(component.navToWorkflowId.emit).toHaveBeenCalledWith(456);
  });

  it('should return true if isPauseProperty is true', () => {
    component.isPauseProperty = true;

    const result = component.isToggleChange(true);

    expect(result).toBe(true);
  });

  it('should return the passed state if isPauseProperty is false', () => {
    component.isPauseProperty = false;

    const result = component.isToggleChange(false);

    expect(result).toBe(false);
  });
});
