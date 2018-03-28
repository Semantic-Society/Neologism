import { Component, EventEmitter, Input, OnChanges, OnInit, Output, } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { IUserObject, MxgraphService } from '../mxgraph/mxgraph';
import { RecommendationService } from '../services/recommendation.service';

@Component({
  selector: 'app-editbox',
  templateUrl: './editbox.component.html',
  styleUrls: ['./editbox.component.css'],
})
export class EditboxComponent implements OnChanges {
  protected propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; creator: string; }>;
  @Input() selectedClass: IUserObject;
  @Input() mx: MxgraphService;

  constructor(private recommender: RecommendationService) {
  }

  ngOnChanges(input) {
    const theVal: IUserObject = input.selectedClass.currentValue;
    this.getProperties(theVal);
  }

  getProperties(theClass: IUserObject) {
    this.recommender.propertyRecommendation(theClass.url, theClass.creator)
      .subscribe((res) => { this.propertyRecommendations = res; console.log('Received Property Recommendation', res); });
  }

  addToGraph(rec: { comment: string; label: string; uri: string; range: string; creator: string; }) {
    // console.log('editbox -> addToGraph:', this.selectedClass.url, rec.uri, rec.label, rec.range)
    this.mx.insertProperty(this.selectedClass.url, rec.uri, rec.label, rec.range);
  }
}
