import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeteorObservable, ObservableCursor, zoneOperator } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { Vocabularies } from '../../../api/collections';
import { Ivocabulary } from '../../../api/models';
import { VocabulariesService } from '../services/vocabularies.service';

@Component({
  selector: 'app-vocablist',
  templateUrl: './vocablist.component.html',
  styleUrls: ['./vocablist.component.css']
})
export class VocablistComponent implements OnInit {

  protected dataSource: Observable<Ivocabulary[]>; // new VocabularyDataSource();

  protected vocabForm = {
    name: '',
    authors: ['You'],
    description: '',
    uriPrefix: '',
    // classes: []
  };
  // displayedColumns = ['name', 'authors', 'description', 'uriPrefix', 'actions'];
  displayedColumns = ['name', 'authors', 'description', 'uriPrefix'];

  constructor(protected router: Router, private vocabService: VocabulariesService) { }

  ngOnInit() {
    this.dataSource = this.vocabService.getVocabularies();
  }

  // TODO: Move to VocabService #decouple
  addVocabulary() {
    this.vocabService.createVocabulary(
      this.vocabForm.name,
      this.vocabForm.authors,
      this.vocabForm.description,
      this.vocabForm.uriPrefix
    );
  }

  deleteVocab(id) {
    this.vocabService.deleteVocabulary(id);
  }

  openVocab(id: string) {
    window.open('../v/' + id);
  }

  // randomStr(m) {
  //   m = m || 9;
  //   let s = '';
  //   const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   for (let i = 0; i < m; i++) { s += r.charAt(Math.floor(Math.random() * r.length)); }
  //   return s;
  // }

}

// tslint:disable-next-line:max-classes-per-file
// export class VocabularyDataSource extends DataSource<any> {
//   constructor() {
//     super();
//   }
//   connect(): Observable<Ivocabulary[]> {
//     return

//     (Vocabularies.find({})
//       .pipe(
//         zoneOperator(),
//         // map((x) => { // console.log(x);
//         //   return x;
//         // })
//       ) as any;
//   }
//   disconnect() { }
// }
