import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BatchRecommendations } from '../services/BatchRecommendations';
import { RecommendationService } from '../services/recommendation.service';
import { IClassWithProperties } from '../services/vocabularies.service';


@Component({
  selector: 'app-batchRecommender',
  templateUrl: './batchRecommender.component.html',
  styleUrls: ['./batchRecommender.component.css']
})

export class BatchRecommenderComponent implements OnInit, OnDestroy {

   subscription: Subscription;
   radioSelected: Array<any>;
  @Input() classes: BatchRecommendations[];

  constructor() { }

 ngOnInit() {
    this.radioSelected = new Array();

  }

  ngOnDestroy() {
  }

  radioFun() {
    console.log(this.radioSelected);
  }

}
