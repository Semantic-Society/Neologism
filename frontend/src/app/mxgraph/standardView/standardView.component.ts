import { Component, Input, OnInit } from '@angular/core';
import { N3Codec } from '../N3Codec';

@Component({
  selector: 'app-standardview',
  templateUrl: './standardView.component.html',
  styleUrls: ['./standardView.component.css']
})
export class StandardViewComponent implements OnInit {
  @Input() vocab: N3Codec;
  constructor() { }

  ngOnInit() {
  }

}
