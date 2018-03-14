import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
  }
  editMode: Number = 0;
  title = 'app';

  getEditMode(){
    return this.editMode;
  }
}
