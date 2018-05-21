import { Component, OnInit } from '@angular/core';
import { ObservableCursor, zoneOperator } from 'meteor-rxjs';
import { Vocabularies } from '../../../api/collections';
import { Ivocabulary } from '../../../api/models';
import {Meteor} from 'meteor/meteor';

@Component({
  selector: 'app-vocablist',
  templateUrl: './vocablist.component.html',
  styleUrls: ['./vocablist.component.css']
})
export class VocablistComponent implements OnInit {

  constructor() { }
  vocab; // : ObservableCursor<Ivocabulary>;

  ngOnInit() {
    this.vocab = Vocabularies.find({}).pipe(zoneOperator()).map((x) => { console.log(x); return x; });
    console.log('WTF');
  }

  addRandom() {
    Meteor.call('vocabulary.create',
      {
        name:this.randomStr(10),
        authors: [this.randomStr(6),this.randomStr(6)],
        description: this.randomStr(100),
        uriPrefix: this.randomStr(14)
      }
        );
  }

  randomStr(m) {
    m = m || 9;
    let s = '';
    const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < m; i++) { s += r.charAt(Math.floor(Math.random() * r.length)); }
    return s;
  }

}
