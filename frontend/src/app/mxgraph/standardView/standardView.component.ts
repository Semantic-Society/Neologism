import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IClassWithProperties, VocabulariesService } from '../../services/vocabularies.service';

import { Observable } from 'rxjs/Observable';

import { Iclass } from '../../../../api/models';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-standardview',
  templateUrl: './standardView.component.html',
  styleUrls: ['./standardView.component.css']
})

export class StandardViewComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  @Input() classes: Observable<IClassWithProperties[]>;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
