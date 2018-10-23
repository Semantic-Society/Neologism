import {Component, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.html',
  styleUrls: ['./node-creator.css'],
})
export class NodeCreatorComponent {
  protected newClass = {
    name: '',
    URI: '',
    description: '',
    property: {
      name: '',
      URI: '',
      description: '',
      range: ''
    }
  };
}
