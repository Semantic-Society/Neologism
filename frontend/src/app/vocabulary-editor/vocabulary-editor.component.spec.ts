import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyEditorComponent } from './vocabulary-editor.component';

describe('VocabularyEditorComponent', () => {
  let component: VocabularyEditorComponent;
  let fixture: ComponentFixture<VocabularyEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabularyEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
