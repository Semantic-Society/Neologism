import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @Input() inputValue:String;
  constructor() { }

  ngOnInit() {
  }

}
