import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FOLDER_STRUCTURE } from 'src/app/core/utils/constants';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule, DatePipe } from '@angular/common';
import { XmlEditorComponent } from 'src/app/shared/components/xml-editor/xml-editor.component';
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
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-workflow-settings',
  standalone: true,
  imports: [
    NgSelectModule,
    MatSlideToggleModule,
    DatePipe,
    CommonModule,
    XmlEditorComponent,
    MonacoEditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './workflow-settings.component.html',
  styleUrl: './workflow-settings.component.scss',
})
export class WorkflowSettingsComponent implements OnInit, AfterViewInit {
  folderStructure = FOLDER_STRUCTURE;

  @Input()
  xmlTemplates: any[] = [];

  selectedTemplate: any = '';

  isReadOnly: boolean = true;

  ngOnInit(): void {
    if (this.xmlTemplates.length > 0) {
      this.selectedTemplate = this.xmlTemplates[0].template;
      this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
    }
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
    private fb: FormBuilder
  ) {
    this.reactiveForm = this.fb.group({
      code: [''],
    });
    console.log('Reactive Form Initialized');
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
    console.log('monaco', monaco);
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
    this.selectedTemplate = this.xmlTemplates[index].template;
    this.reactiveForm.get('code')?.setValue(this.selectedTemplate);
    console.log('selected', this.selectedTemplate);
  }

  checkboxSyling() {}
}
