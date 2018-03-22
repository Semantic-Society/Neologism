import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class EditboxComponent {
  @Input() selectedClass: IUserObject;
  @Input() mx: MxgraphService;

  constructor(private recommender: RecommendationService) { }

}
