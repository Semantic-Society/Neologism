import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MxGraphEditorComponent } from './mx-graph-editor.component';

describe('MxGraphEditorComponent', () => {
  let component: MxGraphEditorComponent;
  let fixture: ComponentFixture<MxGraphEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MxGraphEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MxGraphEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
