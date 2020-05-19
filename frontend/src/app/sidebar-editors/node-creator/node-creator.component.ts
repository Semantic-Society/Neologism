import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {VocabulariesService} from '../../services/vocabularies.service';
import { SideBarStateService } from '../../services/state-services/sidebar-state.service';

@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.html',
  styleUrls: ['./node-creator.css'],
})
export class NodeCreatorComponent {
  @Input() vocabID: string;
  constructor(private vocabService: VocabulariesService, private sidebarService: SideBarStateService) {
  }

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
  
  protected emptyClass = {
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

  addClass() {
    console.log(this.newClass);
    this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI);
    this.newClass = this.emptyClass;
  }

  resetSidebarState(){
    this.sidebarService.changeSidebarToDefault()
  }
}
