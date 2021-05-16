import { Component, Input } from '@angular/core';
import { domain } from 'process';

import { MeteorObservable, zoneOperator } from "meteor-rxjs";
import { Vocabularies } from '../../../api/collections';
import { IvocabularyExtended } from '../../../api/models';
import { VocabulariesService } from '../services/vocabularies.service';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent {
  @Input() vocabulary: IvocabularyExtended;
  domain:string
  public editing:boolean = false;
  constructor( 

    private vocabService: VocabulariesService,
  ){
  }

  editDomain(){
    MeteorObservable.call("vocabulary.addDomain",this.domain,this.vocabulary._id).pipe(zoneOperator())
    .subscribe((_response) => {
      // Handle success and response from server!
    }, (err) => {
      console.log(err);
      // Handle error
    });;
    console.log(this.vocabService.getVocabulary(this.vocabulary._id))
      this.editing = false
      console.log(this.vocabulary)
  }
  startEdit(){
    this.editing=!this.editing;
  }
}
