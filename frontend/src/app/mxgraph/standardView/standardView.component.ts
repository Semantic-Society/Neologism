import { Component, Input, OnInit } from '@angular/core';
import { VocabulariesService } from '../../services/vocabularies.service';

import { Observable } from 'rxjs/Observable';

import { Iclass } from '../../../../api/models';

@Component({
  selector: 'app-standardview',
  templateUrl: './standardView.component.html',
  styleUrls: ['./standardView.component.css']
})

export class StandardViewComponent implements OnInit {

  @Input() classes: Observable<Iclass[]>;

  constructor() { }

  ngOnInit() {

    console.log(this.classes);
    this.classes.map((clazzes) => {
      console.log(clazzes);
      return 0;
    }).subscribe();
  }

}
