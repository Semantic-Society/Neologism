import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Vocabularies } from '../../../api/collections';
import { Ivocabulary } from '../../../api/models';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit {
  @Input() vocabID: string;

  private vocabulary;//: Observable<Ivocabulary[]>;

  constructor() { }

  ngOnInit() {
    this.vocabulary =
      Vocabularies
        .find({ _id: this.vocabID })
        .filter((vArr) => vArr.length > 0);
  }

}
