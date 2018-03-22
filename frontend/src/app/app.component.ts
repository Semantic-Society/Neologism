import { Component, EventEmitter, Output } from '@angular/core';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

 // private state;

  constructor(/*state: StateService*/) {
    // this.state = state;
  }
  // /**
  //  * Three modes are possible: "none", "recommend", "viewClass".
  //  *
  //  * Meaning; do not show the drawer, show the class recommender view, or show the info of a class (which contains options to edit it)
  //  */
  // rightDrawerMode = 'recommend';
  // title = 'app';
  // currentLabel = 'Type query here ...';
  // currentIdentifier = '';
  // currentDescrpition = '';
  // // toggleEditMode(event?) {
  // //   this.currentLabel = event;
  // //   if (this.editMode === 1) {
  // //     this.editMode = 0;
  // //   } else {
  // //     this.editMode = 1;
  // //   }
  // // }
  // startNewRecommendation() {
  //   this.rightDrawerMode = 'recommend';
  // }
  // showClassInfoBox(classInfo: { uri: string; label: string; currentProperties: { uri: string; label: string } }) {
  //   this.rightDrawerMode = 'viewClass';
  // }
  // updateCurrentLabel(event) {
  //   console.log('New label name is: ' + event);
  //   this.currentLabel = event;
  // }

}
