import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Iclass } from '../../../../api/models';
import { IClassWithProperties, VocabulariesService } from '../../services/vocabularies.service';

@Component({
  selector: 'app-standardview',
  templateUrl: './standardView.component.html',
  styleUrls: ['./standardView.component.css']
})

export class StandardViewComponent implements OnInit, OnDestroy {

   subscription: Subscription;
  @Input() classes: Observable<IClassWithProperties[]>;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
