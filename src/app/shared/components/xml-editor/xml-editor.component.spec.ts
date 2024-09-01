import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlEditorComponent } from './xml-editor.component';

describe('XmlEditorComponent', () => {
  let component: XmlEditorComponent;
  let fixture: ComponentFixture<XmlEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editor options correctly', () => {
    expect(component.editorOptions).toEqual({
      theme: 'vs-dark',
      language: 'javascript',
    });
  });

  it('should have initial code value', () => {
    expect(component.code).toBe(
      'function x() {\nconsole.log("Hello world!");\n}'
    );
  });

  it('should have initial originalCode value', () => {
    expect(component.originalCode).toBe('function x() ');
  });

  it('should initialize xmlContent correctly', () => {
    const expectedXmlContent =
      "<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>";
    expect(component.xmlContent).toBe(expectedXmlContent);
  });

  it('should update xmlContent when onContentChange is called', () => {
    const newContent = '<note><to>John</to></note>';
    component.onContentChange(newContent);
    expect(component.xmlContent).toBe(newContent);
  });
});
