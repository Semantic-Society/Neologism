import { Component, OnInit } from '@angular/core';
import { VocabulariesService } from '../../../app/services/vocabularies.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vocabulary-list',
  templateUrl: './vocabulary-list.component.html',
  styleUrls: ['./vocabulary-list.component.scss']
})
export class VocabularyListComponent implements OnInit {
  public dataSet: Observable<any>;

  constructor( private vocabService: VocabulariesService ) {
    this.dataSet = this.vocabService.getVocabularies();

  }

  ngOnInit() {
  }

}
