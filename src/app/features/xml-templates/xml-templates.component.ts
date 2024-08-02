import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  MonacoEditorComponent,
  MonacoEditorConstructionOptions,
  MonacoEditorLoaderService,
  MonacoEditorModule,
} from '@materia-ui/ngx-monaco-editor';
import { NgSelectModule } from '@ng-select/ng-select';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-xml-templates',
  standalone: true,
  imports: [
    NgSelectModule,
    DatePipe,
    CommonModule,
    MonacoEditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './xml-templates.component.html',
  styleUrl: './xml-templates.component.scss',
})
export class XmlTemplatesComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  xmlTemplates: any[] = [];

  xmlTemplatesById: any[] = [];

  selectedTemplate: any = '';

  isReadOnly: boolean = true;

  isEditable: boolean = false;

  updatedTemplate: any = '';

  headings: string[] = ['S.NO', 'NAME', 'DESCRIPTION', 'CREATED', 'MODIFIED'];
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

  ngOnInit(): void {
    this.getTemplates(this.pageParams);
    console.log('editor options', this.editorOptions);
  }

  @ViewChild(MonacoEditorComponent, { static: false })
  monacoComponent!: MonacoEditorComponent;
  editorOptions: MonacoEditorConstructionOptions = {
    theme: 'myCustomTheme',
    language: 'xml',
    roundedSelection: true,
    autoIndent: 'full',
    readOnly: this.isReadOnly,
  };
  reactiveForm: FormGroup;

  constructor(
    private monacoLoaderService: MonacoEditorLoaderService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.reactiveForm = this.fb.group({
      code: [''],
    });
    console.log('Reactive Form Initialized');
  }

  public getTemplates(pageParams: any) {
    this.apiService
      .getAllTemplates(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.xmlTemplates = data.content;
        this.cdRef.markForCheck();
        console.log('templates', this.xmlTemplates);
      });
  }

  public editTemplate(id: any, template: any) {
    this.apiService.updateTemplate(id, template).subscribe((result: any) => {
      this.updatedTemplate = result;
    });
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
    console.log('template id:', templateId);
    this.router.navigate(['/template', templateId]);
  }
}
