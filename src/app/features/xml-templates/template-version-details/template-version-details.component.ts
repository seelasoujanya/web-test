import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from 'src/app/core/services/api.service';
import {
  MonacoEditorComponent,
  MonacoEditorConstructionOptions,
  MonacoEditorLoaderService,
  MonacoEditorModule,
  MonacoStandaloneCodeEditor,
} from '@materia-ui/ngx-monaco-editor';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-template-version-details',
  standalone: true,
  imports: [
    NgSelectModule,
    CommonModule,
    MonacoEditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './template-version-details.component.html',
  styleUrls: ['./template-version-details.component.scss'],
  providers: [BsModalService],
})
export class TemplateVersionDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private destroyed$ = new Subject<void>();
  public page!: IPage<any>;
  private pageParams = this.getDefaultPageParams();

  templateId!: number;
  xmlTemplatesById: any[] = [];
  selectedTemplate: string = '';
  isReadOnly: boolean = true;
  isEditable: boolean = false;
  updatedTemplate: string = '';
  editedTemplate: any;

  compareTemplate = {
    template: '',
  };

  templates: any[] = [];

  templateNames: any[] = [];

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
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {
    this.templateId = +this.route.snapshot.params['id'];
    this.reactiveForm = this.fb.group({
      code: [''],
    });
    console.log('Reactive Form Initialized');
  }

  ngOnInit(): void {
    this.getTemplates(this.pageParams);
    this.getTemplatesByTemplateId(this.templateId);
    console.log('editor options', this.editorOptions);
  }

  ngAfterViewInit(): void {
    console.log('enter afterview');
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => !!isLoaded),
        take(1)
      )
      .subscribe(() => {
        console.log('loaded');
        if (this.monacoComponent) {
          this.monacoComponent.init.subscribe(
            (editor: MonacoStandaloneCodeEditor) => {
              console.log('Monaco editor initialized', editor);
              this.editorInit(editor);
            }
          );
        }
        this.registerMonacoCustomTheme();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 10,
      sortBy: '',
      order: 'asc',
    };
  }

  mergeOptions(partialOptions: any) {
    return {
      ...this.editorOptions,
      ...partialOptions,
    };
  }

  editorInit(editor: any) {
    console.log('initialised', editor);
    editor.setSelection({
      startLineNumber: 1,
      startColumn: 1,
      endColumn: 50,
      endLineNumber: 3,
    });
  }

  registerMonacoCustomTheme() {
    if (typeof monaco !== 'undefined') {
      monaco.editor.defineTheme('myCustomTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          {
            token: 'comment',
            foreground: 'ffa500',
            fontStyle: 'italic underline',
          },
        ],
        colors: {},
      });
    } else {
      console.error('Monaco is undefined');
    }
  }

  selectTemplate(index: number) {
    console.log('index', index);
    if (index >= 0 && index < this.xmlTemplatesById.length) {
      this.selectedTemplate = this.xmlTemplatesById[index].updatedTemplate;
      this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
      console.log('selected', this.selectedTemplate);
    } else {
      console.error('Invalid index', index);
    }
  }

  isEditableTemplate() {
    this.isReadOnly = !this.isReadOnly;
    this.isEditable = !this.isEditable;
    this.editorOptions = this.mergeOptions({ readOnly: this.isReadOnly });
    this.cdRef.detectChanges();
  }

  getTemplatesByTemplateId(id: number) {
    this.apiService
      .getTemplatesByTemplateId(id, this.pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.xmlTemplatesById = data.content;
        this.cdRef.markForCheck();
        console.log('templatesByTemplateId', this.xmlTemplatesById);
        if (this.xmlTemplatesById.length > 0) {
          this.selectedTemplate = this.xmlTemplatesById[0].template.xmlTemplate;
          this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
        }
      });
  }

  public editTemplate() {
    this.editedTemplate = this.reactiveForm.get('code')?.value;
    console.log('TEMPLATE edit', this.editedTemplate);
    const editedVersion = {
      id: this.templateId,
      xmlTemplate: `"${this.editedTemplate}"`,
    };
    this.apiService
      .updateTemplate(this.templateId, editedVersion)
      .subscribe((result: any) => {
        this.getTemplatesByTemplateId(this.templateId);
      });
  }

  public getTemplates(pageParams: any) {
    this.apiService
      .getAllTemplates(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.templates = data.content;
        this.templateNames = this.templates.map(template => template.name);
        this.cdRef.markForCheck();
      });
  }

  openCompareDialog(compareTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(compareTemplate, config);
  }

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  compareChanges() {}
}
