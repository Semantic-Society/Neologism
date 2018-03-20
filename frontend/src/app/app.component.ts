import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
  }
  editMode = 0;
  title = 'app';
  currentLabel = 'Type query here ...';
  currentIdentifier = '';
  currentDescrpition = '';

  toggleEditMode(event?) {
    this.currentLabel = event;
    if (this.editMode === 1) {
      this.editMode = 0;
    } else {
      this.editMode = 1;
    }
  }

  updateCurrentLabel(event) {
    console.log('New label name is: ' + event);

    this.currentLabel = event;
  }

}
