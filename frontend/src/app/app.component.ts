import {Component, EventEmitter, Output} from '@angular/core';

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
  currentLabel:String ="dcat:Catalog";
  currentIdentifier:String = "http://www.w3.org/ns/dcat#Catalog";
  currentDescrpition:String = "Some Awesome Description";


  toggleEditMode(event){
    this.currentLabel = event;
    if (this.editMode == 1) {
      this.editMode=0;
    }else{
      this.editMode=1;
    }
  }

  updateCurrentLabel(event){
    console.log("New label name is: " +event);

    this.currentLabel=event;
  }

}
