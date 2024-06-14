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
import { Workflow } from '../interfaces/workflow.model';

@Injectable()
export class PaginationService implements OnDestroy {
  private workflows$ = new BehaviorSubject<any[]>([]);
  private destroyed$ = new Subject<void>();
  private updateParams$ = new Subject<void>();
  private lastLoadedPage = -1;
  private endOfPages = false;
  private apiError = false;

  private projectParams = {
    page: 0,
    pageSize: 10,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private spinnerService: SpinnerService
  ) {
    this.workflowsList();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get workflowsList$(): Observable<any[]> {
    return this.workflows$.asObservable();
  }

  public getWorkflows(): void {
    this.updateParams$.next();
  }

  private workflowsList(): void {
    this.updateParams$
      .pipe(
        switchMap(() => this.getWorkflowsList()),
        tap((workflows: any[]) => this.updateWorkflowsData(workflows)),
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

  private getWorkflowsList(): Observable<any[]> {
    this.spinnerService.show();
    this.apiError = false;
    return this.apiService
      .getWorkflows(this.projectParams)
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
    if (this.projectParams.page) {
      return this.workflows$.next(this.workflows$.getValue().concat(workflows));
    }
    return this.workflows$.next(workflows);
  }

  public updateWorkflow(updatedWorkflow: Workflow, workflowStatus: boolean) {
    const workflows = this.workflows$.getValue();
    workflows.forEach(workflow => {
      if (workflow.id === updatedWorkflow.id) {
        workflow.enabled = workflowStatus;
        return;
      }
    });
    this.workflows$.next(workflows);
  }

  // TODO: use angular service
  public scrollUp(): void {
    window.scroll({
      top: 0,
      left: 0,
    });
  }
}
