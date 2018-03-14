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


  labelName: String = "dcat:Catalog";

  ngOnInit() {
  }

  public activateEditMode():void {
    this.onEditToggled.emit(this.labelName);
  }
  constructor() { }

}
