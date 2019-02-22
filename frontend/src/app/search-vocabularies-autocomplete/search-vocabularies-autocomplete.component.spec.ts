import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchVocabulariesAutocompleteComponent } from './search-vocabularies-autocomplete.component';

describe('SearchVocabulariesAutocompleteComponent', () => {
  let component: SearchVocabulariesAutocompleteComponent;
  let fixture: ComponentFixture<SearchVocabulariesAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchVocabulariesAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchVocabulariesAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
