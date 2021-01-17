import { Component, Input } from '@angular/core';
import { VocabulariesService } from '../services/vocabularies.service';
import { SideBarStateService } from '../services/state-services/sidebar-state.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MxgraphService } from '../mxgraph/mxgraph';
@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.html',
  styleUrls: ['./node-creator.css'],
})
export class SideBarNodeCreatorComponent {
  @Input() vocabID: string;
  @Input() uriPrefix: string;
  @Input() graphService: MxgraphService;


  constructor(private vocabService: VocabulariesService,
    private sidebarService: SideBarStateService,
    private _snackBar: MatSnackBar) {
  }
  selectedClassID
  newClass = {
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

  emptyClass = {
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

  static CLASS_ADD_MESSAGE = 'A new class has been added!'

  addClass() {
    // centering new class position on creation
    const pos = this.graphService.viewCenter()
    this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI, pos);
    this.newClass = this.emptyClass;
    this._snackBar.open(SideBarNodeCreatorComponent.CLASS_ADD_MESSAGE, 'Close', {
      duration: 2000,
    });
    this.resetSidebarState()
  }

  autoCompleteURI($event) {
    console.log($event);
    this.newClass.URI = `${this.uriPrefix}${$event.target.value}`

  }

  resetSidebarState() {
    this.sidebarService.changeSidebarToDefault()
  }
}
