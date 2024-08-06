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
  MonacoDiffEditorComponent,
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
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';

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
  firstTemplate: any;
  secondTemplate: any;
  showDifferences: boolean = false;
  originalCode: any;
  modifiedCode: any;
  templateName: any;
  selectedTemplateIndex: any;

  compareTemplate = {
    firstTemplate: '',
    secondTemplate: '',
    description: '',
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

  diffEditorOptions: MonacoEditorConstructionOptions = {
    theme: 'myCustomTheme',
    readOnly: true,
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
    private bsModalRef: BsModalRef,
    private spinnerService: SpinnerService
  ) {
    this.templateId = +this.route.snapshot.params['id'];
    this.reactiveForm = this.fb.group({
      code: [''],
    });
    console.log('Reactive Form Initialized');
  }

  ngOnInit(): void {
    // this.getTemplates(this.pageParams);
    this.selectedTemplateIndex = 0;
    this.getTemplatesByTemplateId(this.templateId);
  }

  ngAfterViewInit(): void {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => !!isLoaded),
        take(1)
      )
      .subscribe(() => {
        if (this.monacoComponent) {
          this.monacoComponent.init.subscribe(
            (editor: MonacoStandaloneCodeEditor) => {
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
    this.selectedTemplateIndex = index;
    if (index >= 0 && index < this.xmlTemplatesById.length) {
      this.selectedTemplate = this.xmlTemplatesById[index].templateCode;
      this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
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
    this.spinnerService.show();
    this.apiService
      .getTemplatesByTemplateId(id, this.pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.xmlTemplatesById = data.content;
        this.spinnerService.hide();
        this.cdRef.markForCheck();
        if (this.xmlTemplatesById.length > 0) {
          this.xmlTemplatesById.forEach((template, index) => {
            const versionNumber = index + 1;
            if (!this.selectedTemplate) {
              this.selectedTemplate = template.templateCode;
            }
            template['displayName'] = 'Version ' + versionNumber;
          });
          this.xmlTemplatesById.reverse();
          console.log('diplay', this.xmlTemplatesById);
          this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
        }
      });
  }

  public editTemplate() {
    this.editedTemplate = this.reactiveForm.get('code')?.value;

    const modalData = {
      title: 'Confirm Template Edit',
      description: 'Are you sure you want to save changes to this template?',
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
      enableComments: true,
    };

    this.bsModalRef = this.modalService.show(ConfirmModalComponent);
    this.bsModalRef.content.title = modalData.title;
    this.bsModalRef.content.description = modalData.description;
    this.bsModalRef.content.applyButton = modalData.btn1Name;
    this.bsModalRef.content.cancelButton = modalData.btn2Name;
    this.bsModalRef.content.enableComments = modalData.enableComments;
    this.bsModalRef.content.updateChanges.subscribe((result: any) => {
      if (result) {
        const editedVersion = {
          id: this.templateId,
          description: result,
          templateCode: `"${this.editedTemplate}"`,
        };
        this.apiService
          .updateTemplate(this.templateId, editedVersion)
          .subscribe((result: any) => {
            this.getTemplatesByTemplateId(this.templateId);
          });
      } else {
        this.cancelChangesToUpdateTemplate();
      }
    });
  }

  cancelChangesToUpdateTemplate() {
    this.editedTemplate = '';
    this.showDifferences = false;
    this.compareTemplate.firstTemplate = '';
    this.compareTemplate.secondTemplate = '';
  }

  // public getTemplates(pageParams: any) {
  //   this.apiService
  //     .getAllTemplates(pageParams)
  //     .pipe(takeUntil(this.destroyed$))
  //     .subscribe(data => {
  //       this.page = data;
  //       this.templates = data.content;
  //       this.templateNames = this.templates.map(template => template.name);
  //       this.cdRef.markForCheck();
  //     });
  // }

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
    this.showDifferences = false;
    this.compareTemplate.firstTemplate = '';
    this.compareTemplate.secondTemplate = '';
  }

  selectFirstTemplate(firstTemplate: any) {
    this.firstTemplate = firstTemplate;
    this.originalCode = firstTemplate.templateCode;
  }

  selectSecondTemplate(secondTemplate: any) {
    this.secondTemplate = secondTemplate;
    this.modifiedCode = secondTemplate.templateCode;
  }

  compareChanges() {
    this.showDifferences = true;
  }

  isCompareAllowed(): boolean {
    return this.compareTemplate.description.trim() !== '';
  }
}
