import { Component, Input } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FOLDER_STRUCTURE } from 'src/app/core/utils/constants';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule, DatePipe } from '@angular/common';
import { XmlEditorComponent } from 'src/app/shared/components/xml-editor/xml-editor.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-workflow-settings',
  standalone: true,
  imports: [
    NgSelectModule,
    MatSlideToggleModule,
    DatePipe,
    CommonModule,
    XmlEditorComponent,
    FormsModule,
  ],
  templateUrl: './workflow-settings.component.html',
  styleUrl: './workflow-settings.component.scss',
})
export class WorkflowSettingsComponent {
  folderStructure = FOLDER_STRUCTURE;

  @Input()
  xmlTemplates: any[] = [];

  selectedTemplate: any = '';

  isReadOnly: boolean = true;

  ngOnInit(): void {}

  constructor() {}
}
