import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

@Component({
  selector: 'app-infobox',
  templateUrl: './infobox.component.html',
  styleUrls: ['./infobox.component.css']
})
export class InfoboxComponent implements OnInit {
  @Input() currentMode : Number;
  @Output() onEditToggled: EventEmitter<any> = new EventEmitter<any>();
  recommenderForm: FormControl = new FormControl();

  options = ["Catalog", "Bla", "usw"
  ]; //example Options
  recommendedOptions: Observable<string[]>;

  ngOnInit() {
    this.recommendedOptions = this.recommenderForm.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
  }

  filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }
  public toggleEditMode():void {
    this.onEditToggled.emit(1);
  }
  constructor() { }

}
