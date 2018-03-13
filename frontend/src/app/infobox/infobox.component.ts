import { Component, OnInit } from '@angular/core';
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

  recommenderForm: FormControl = new FormControl();

  options = [
    'One',
    'Two',
    'Three'
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
  constructor() { }

}
