import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { RecommendationService } from '../services/recommendation.service';

@Component({
  selector: 'app-infobox',
  templateUrl: './infobox.component.html',
  styleUrls: ['./infobox.component.css'],
})
export class InfoboxComponent implements OnInit {
  @Input() currentMode: number;
  @Input() inputLabel: string;
  @Input() inputIdentifier: string;
  @Input() inputDescription: string;
  @Output() onEditToggled: EventEmitter<any> = new EventEmitter<any>();


  constructor(private recommender: RecommendationService) { }

  ngOnInit() {
  }

  public activateEditMode(): void {
    this.onEditToggled.emit(this.inputLabel);
  }
}
