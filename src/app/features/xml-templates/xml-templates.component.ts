import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { CommonTableComponent } from 'src/app/shared/components/common-table/common-table.component';
import { IPage } from 'src/app/core/models/page.model';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { TimeFormatService } from 'src/app/time-format.service';

@Component({
  selector: 'app-xml-templates',
  standalone: true,
  imports: [
    NgSelectModule,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent,
    CommonTableComponent,
    CodemirrorModule,
  ],
  templateUrl: './xml-templates.component.html',
  styleUrl: './xml-templates.component.scss',
  providers: [BsModalService, DatePipe],
})
export class XmlTemplatesComponent implements OnInit, OnDestroy {
  editorOptions = {
    lineNumbers: true,
    mode: 'xml',
    tabSize: 2,
    indentWithTabs: true,
    lineWrapping: true,
  };
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  xmlTemplates: any[] = [];

  xmlTemplatesById: any[] = [];

  selectedTemplate: any = '';

  isReadOnly: boolean = false;

  isEditable: boolean = false;

  updatedTemplate: any = '';

  isUTC = false;

  newTemplateData = {
    name: '',
    description: '',
    templateCode: '',
  };

  headings: string[] = ['NAME', 'DESCRIPTION', 'CREATED', 'MODIFIED'];

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.getPageItems(this.pageParams);
  }
  public page!: IPage<any>;
  private pageParams = this.getDefaultPageParams();

  getDefaultPageParams() {
    return {
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    };
  }

  getPageItems(pageParams: any) {
    this.getTemplates(pageParams);
  }

  ngOnInit(): void {
    this.getPageItems(this.pageParams);
    //  this.getTemplates(this.pageParams);
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  formatDate(date: string | Date) {
    return this.timeFormatService.formatDate(date);
  }

  public get getBsModalRef(): BsModalRef {
    return this.bsModalRef;
  }

  reactiveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private datePipe: DatePipe,
    private router: Router,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private spinnerService: SpinnerService,
    private timeFormatService: TimeFormatService
  ) {
    this.reactiveForm = this.fb.group({
      code: [''],
    });
  }

  editorInit(editor: any) {
    editor.setSelection({
      startLineNumber: 1,
      startColumn: 1,
      endColumn: 50,
      endLineNumber: 3,
    });
  }

  public getTemplates(pageParams: any) {
    this.spinnerService.show();
    this.apiService
      .getAllTemplates(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.xmlTemplates = data.content;
        this.spinnerService.hide();
        this.cdRef.markForCheck();
      });
  }

  public editTemplate(id: any, template: any) {
    this.apiService.updateTemplate(id, template).subscribe((result: any) => {
      this.updatedTemplate = result;
    });
  }

  getTableValues(): any[] {
    const values = this.xmlTemplates.map(template => [
      template.name,
      template.description,
      `${this.formatDate(template.created).date}<br />` +
        `<span class="time">${this.formatDate(template.created).time} </span>`,
      `${this.formatDate(template.modified).date}<br />` +
        `<span class="time">${this.formatDate(template.modified).time} </span>`,
      { id: template.id },
    ]);
    return values;
  }

  public saveTemplateChanges() {
    const modalData = {
      title: 'Confirm Changes',
      description: `Are you sure you want to Save changes  for Template?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
  }

  navigateToTemplateDetails(templateId: number): void {
    this.router.navigate(['/templates', templateId]);
  }

  openCreateTemplateDialog(emailTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(emailTemplate, config);
  }

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  public cancelChanges() {
    this.closeModal();
    this.reset();
  }

  reset() {
    this.newTemplateData = {
      name: '',
      description: '',
      templateCode: '',
    };
  }

  public createTemplate() {
    this.bsModalRef.hide();
    this.apiService
      .addTemplate(this.newTemplateData)
      .subscribe((result: any) => {
        this.xmlTemplates.push(result);
      });
    this.reset();
  }
}
