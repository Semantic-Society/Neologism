import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyListComponent } from './vocabulary-list.component';

describe('VocabularyListComponent', () => {
  let component: VocabularyListComponent;
  let fixture: ComponentFixture<VocabularyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocabularyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
