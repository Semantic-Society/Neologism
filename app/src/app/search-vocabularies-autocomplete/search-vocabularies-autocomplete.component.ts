import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Meteor} from 'meteor/meteor';
import {VocabulariesService} from '../services/vocabularies.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'search-vocabularies-autocomplete',
    templateUrl: './search-vocabularies-autocomplete.component.html',
    styleUrls: ['./search-vocabularies-autocomplete.component.scss']
})
export class SearchVocabulariesAutocompleteComponent implements OnInit {
  @Input() width: string;
  inputValue: string;
  vocabs: any;

  constructor(private vocabService: VocabulariesService) { }

  ngOnInit() {
      this.vocabs = [];
  }

  onChange($event: Event): void {
      const value = ($event.target as HTMLInputElement).value;
      if (!value) {
          this.vocabs = [];
      } else {
          this.vocabs = this.vocabService.searchVocabByName(value, Meteor.userId());
      }
  }
}
