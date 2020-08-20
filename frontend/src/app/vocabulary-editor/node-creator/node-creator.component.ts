import { Component, Input } from '@angular/core';
import { VocabulariesService } from '../../../app/services/vocabularies.service';
import { SideBarStateService } from '../../../app/services/state-services/sidebar-state.service';

@Component({
  selector: 'vocab-app-node-creator',
  templateUrl: './node-creator.component.html',
  styleUrls: ['./node-creator.component.scss']
})
export class VocabNodeCreatorComponent {

  @Input() vocabID: string;
  constructor( private vocabService: VocabulariesService,  private sidebarService: SideBarStateService) {
  }

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

  addClass() {
    console.log(this.newClass, this.vocabID);
    this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI);
    this.newClass = this.emptyClass;
  }

}
