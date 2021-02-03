import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
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
  @Input() recommendations: BatchRecommendations[];
  @Input() classes: Observable<IClassWithProperties[]>;

  constructor() { }

 ngOnInit() {
    this.radioSelected = new Array();

  }

  ngOnDestroy() {
  }

  radioFun() {
    console.log(this.radioSelected);
    console.log(this.classes)
  }

  test(){
    this.classes.pipe(
      startWith([]),
      debounceTime(1000),
  ).subscribe((cs) => {
    cs.forEach((c) => {
      this.recommendations.forEach(rec =>{
        if(rec.keyword === c.name){
console.log(c.name , rec.keyword);
        }
      })
    });
  })
  }
}
