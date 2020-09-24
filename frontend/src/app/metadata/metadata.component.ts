import { Component, Input } from '@angular/core';

import { Vocabularies } from '../../../api/collections';
import { IvocabularyExtended } from '../../../api/models';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent {
  @Input() vocabulary: IvocabularyExtended;

  constructor() { }

}
