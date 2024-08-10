import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xml-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xml-editor.component.html',
  styleUrl: './xml-editor.component.scss',
})
export class XmlEditorComponent implements OnInit {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = 'function x() {\nconsole.log("Hello world!");\n}';
  originalCode: string = 'function x() ';

  public xmlContent: string =
    "<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>";

  ngOnInit(): void {
    console.log('xml', this.xmlContent);
  }

  onContentChange(content: string): void {
    this.xmlContent = content;
  }
}
