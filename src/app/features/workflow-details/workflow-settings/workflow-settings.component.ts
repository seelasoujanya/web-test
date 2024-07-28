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

  selectedTemplate: any;

  ngOnInit(): void {
    if (this.xmlTemplates.length > 0) {
      this.selectedTemplate = this.xmlTemplates[0];
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
  };
  code = this.getCode();
  reactiveForm: FormGroup;

  constructor(
    private monacoLoaderService: MonacoEditorLoaderService,
    private fb: FormBuilder
  ) {
    this.reactiveForm = this.fb.group({
      code: [this.code],
    });
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

  getCode() {
    console.log('here');
    return "<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don't forget me this weekend!</body>\n</note>";
  }

  registerMonacoCustomTheme() {
    console.log('enter', monaco);
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
    this.selectedTemplate = this.xmlTemplates[index];
    console.log('selected', this.selectedTemplate);
  }

  checkboxSyling() {}
}
