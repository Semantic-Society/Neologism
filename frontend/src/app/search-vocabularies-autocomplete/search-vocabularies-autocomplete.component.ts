import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'search-vocabularies-autocomplete',
  templateUrl: './search-vocabularies-autocomplete.component.html',
  styleUrls: ['./search-vocabularies-autocomplete.component.scss']
})
export class SearchVocabulariesAutocompleteComponent implements OnInit {
  @Input() width: string;
  inputValue: string;
  options = [];

  constructor() { }

  ngOnInit() {
  }

  onChange(value: string): void {
    this.options = new Array(this.getRandomInt(15, 5)).join('.').split('.')
    .map((item, idx) => ({
      value,
      category: `${value}${idx}`,
      count: this.getRandomInt(200, 100),
    }));
  }

  private getRandomInt(max: number, min: number = 0): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
