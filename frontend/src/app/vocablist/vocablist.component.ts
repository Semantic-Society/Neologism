import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeteorObservable, ObservableCursor, zoneOperator } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';

import { Vocabularies } from '../../../api/collections';
import { Ivocabulary } from '../../../api/models';

@Component({
  selector: 'app-vocablist',
  templateUrl: './vocablist.component.html',
  styleUrls: ['./vocablist.component.css']
})
export class VocablistComponent implements OnInit {

  constructor(private router: Router) { }
  dataSource = new VocabularyDataSource();
  displayedColumns = ['name', 'authors', 'description', 'uriPrefix', 'actions'];

  ngOnInit() {
  }

  addRandom() {
    MeteorObservable.call('vocabulary.create',
      {
        name: this.randomStr(10),
        authors: [this.randomStr(6), this.randomStr(6)],
        description: this.randomStr(100),
        uriPrefix: this.randomStr(14)
      }
    ).pipe(zoneOperator())
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        // Handle error
      });
  }

  deleteVocab(id) {
    MeteorObservable.call('vocabulary.remove', id)
      .pipe(zoneOperator())
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        // Handle error
      });
  }

  randomStr(m) {
    m = m || 9;
    let s = '';
    const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < m; i++) { s += r.charAt(Math.floor(Math.random() * r.length)); }
    return s;
  }

}

// tslint:disable-next-line:max-classes-per-file
export class VocabularyDataSource extends DataSource<any> {
  constructor() {
    super();
  }
  connect(): Observable<Ivocabulary[]> {
    return Vocabularies.find({}).pipe(zoneOperator()).map((x) => { console.log(x); return x; }) as Observable<Ivocabulary[]>;
  }
  disconnect() {}
}

