import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { ApiService } from './api.service';
import { SpinnerService } from './spinner.service';

@Injectable()
export class WorkflowDetailsPaginationService implements OnDestroy {
  private workflowInstances$ = new BehaviorSubject<any[]>([]);
  private destroyed$ = new Subject<void>();
  private updateParams$ = new Subject<void>();
  private lastLoadedPage = -1;
  private endOfPages = false;
  private apiError = false;

  private failedInstanceSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  public failedInstances$: Observable<number> =
    this.failedInstanceSubject.asObservable();
  failedInstancesCount = 0;

  private deliveredInstanceSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  public deliveredInstances$: Observable<number> =
    this.deliveredInstanceSubject.asObservable();
  deliveredInstancesCount = 0;

  private totalInstancesSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  public totalInstancesCount$: Observable<number> =
    this.totalInstancesSubject.asObservable();
  totalInstancesCount = 0;

  private projectParams = {
    page: 0,
    pageSize: 10,
  };

  workflowId: number | unknown;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private spinnerService: SpinnerService
  ) {
    this.workflowInstanceList();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get workflowInstanceList$(): Observable<any[]> {
    return this.workflowInstances$.asObservable();
  }

  public getWorkflowInstances(workflowId: number): void {
    this.workflowId = workflowId;
    this.updateParams$.next();
  }

  private workflowInstanceList(): void {
    this.updateParams$
      .pipe(
        switchMap(() => this.getWorkflowInstanceList()),
        tap((workflowsInstances: any[]) =>
          this.updateWorkflowsData(workflowsInstances)
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  public resetPage(sort: string, order: string): void {
    this.projectParams = {
      page: 0,
      pageSize: 10,
    };
    this.updateParams$.next();
  }

  public page(pageSize: number = 10): void {
    if (this.lastLoadedPage == this.projectParams.page && !this.endOfPages) {
      this.projectParams.page = this.projectParams.page + 1;
      this.projectParams.pageSize = pageSize;

      this.updateParams$.next();
    }
  }

  private getWorkflowInstanceList(): Observable<any[]> {
    this.spinnerService.show();
    this.apiError = false;
    return this.apiService
      .getWorkflowInstances(this.projectParams, this.workflowId)
      .pipe(catchError(() => of([]))) as Observable<any[]>;
  }

  private catchErrorHandler(error: Error, source$: any): Observable<any[]> {
    this.spinnerService.hide();
    this.apiError = true;
    return source$;
  }

  private updateWorkflowsData(workflows: any[]): void {
    this.spinnerService.hide();
    this.lastLoadedPage = this.projectParams.page;
    this.endOfPages = !this.apiError && workflows.length == 0;

    workflows.forEach(workflow => {
      if (
        workflow.status &&
        (workflow.status === 'FAILED' || workflow.status === 'CANCELLED')
      ) {
        this.failedInstancesCount++;
      }
    });
    this.failedInstanceSubject.next(this.failedInstancesCount);

    workflows.forEach(workflow => {
      if (
        workflow.status &&
        (workflow.status === 'CREATED' ||
          workflow.status === 'RUNNING' ||
          workflow.status === 'COMPLETED')
      ) {
        this.deliveredInstancesCount++;
      }
    });
    this.deliveredInstanceSubject.next(this.deliveredInstancesCount);

    this.totalInstancesCount += workflows.length;
    this.totalInstancesSubject.next(this.totalInstancesCount);

    if (this.projectParams.page) {
      return this.workflowInstances$.next(
        this.workflowInstances$.getValue().concat(workflows)
      );
    }
    return this.workflowInstances$.next(workflows);
  }

  // TODO: use angular service
  public scrollUp(): void {
    window.scroll({
      top: 0,
      left: 0,
    });
  }
}
