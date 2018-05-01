import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'truncated-text',
  templateUrl: './truncated-text-component.component.html',
  styleUrls: ['./truncated-text-component.component.css']
})
export class TruncatedTextComponentComponent implements OnInit {
  @Input() text: string;
  @Input() limit: number = 40;
  truncating = true;
  constructor() { }

  ngOnInit() {
  }

}
