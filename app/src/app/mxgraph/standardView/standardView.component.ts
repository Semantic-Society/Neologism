import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {IClassWithProperties } from '../../../../api/models';

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
