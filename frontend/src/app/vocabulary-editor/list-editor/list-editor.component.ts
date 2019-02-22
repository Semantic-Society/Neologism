import { Component, OnInit } from '@angular/core';
import { VocabularyEditorService } from '../vocabulary-editor.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.scss']
})
export class ListEditorComponent implements OnInit {
  vocabID: string;
  constructor(private vocabEditorService: VocabularyEditorService) { }

  ngOnInit() {
    this.vocabID = this.vocabEditorService.vocabularyId;
  }

}
