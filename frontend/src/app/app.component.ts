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

  toggleEditMode(){
    if (this.editMode == 1) {
      this.editMode=0;
    }else{
      this.editMode=1;
    }
  }
  getLabel():String{
    return "some";
  }
}
