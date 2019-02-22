import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import sidebar state dep.
import { VocabularyEditorService } from './vocabulary-editor.service';


interface IMergedPropertiesClass {
    _id: string; // Mongo generated ID
    name: string;
    properties: Array<{
        _id: string;
        name: string;
        rangeID: string; // just the ID
    }>;
}
@Component({
  selector: 'app-vocabulary-editor',
  templateUrl: './vocabulary-editor.component.html',
  styleUrls: ['./vocabulary-editor.component.scss']
})
export class VocabularyEditorComponent implements OnInit {
  
  vocabID: string;
  selectedViewMethod: 'mxgraph' | 'list-view';
  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private vocabEditorService: VocabularyEditorService) { }

  ngOnInit() {
    this.vocabID = this.route.snapshot.paramMap.get('id');
    this.vocabEditorService.setVocabularyId(this.vocabID);
    this.selectedViewMethod = 'mxgraph';
  } // end ngOnInit

  changeViewMethod(selection: string) {
    if(selection === 'mxgraph')
      this.router.navigateByUrl('vcblry-edit/' + this.vocabID + '/mxgraph');

    if(selection === 'list-view')
      this.router.navigateByUrl('vcblry-edit/' + this.vocabID + '/list');
  }

 
}
