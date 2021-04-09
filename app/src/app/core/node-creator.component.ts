import { Component, Input } from '@angular/core';
import { VocabulariesService } from '../services/vocabularies.service';
import { SideBarStateService } from '../services/state-services/sidebar-state.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MxgraphService } from '../mxgraph/mxgraph';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SpellCheckerService } from 'ngx-spellchecker';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.html',
  styleUrls: ['./node-creator.css'],
  providers: [SpellCheckerService]
})
export class SideBarNodeCreatorComponent {
  @Input() vocabID: string;
  @Input() uriPrefix: string;
  @Input() graphService: MxgraphService;
  selectedClassID
  static CLASS_ADD_MESSAGE = 'A new class has been added!'
  createClassForm: FormGroup
  contextmenu:boolean = false
  public suggestions:string[]
  
  fileURL = "https://raw.githubusercontent.com/JacobSamro/ngx-spellchecker/master/dict/normalized_en-US.dic"

  constructor(private vocabService: VocabulariesService,
    private sidebarService: SideBarStateService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private spellCheckerService: SpellCheckerService,
    private httpClient: HttpClient) {
    }


  ngOnInit() {  
    this.createClassForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      URI: [
        `${this.uriPrefix}#`,
        {
          asyncValidators: [this.vocabService.uriValidator()],
        }
      ],
      description: ['', []],
    }
    );


}


checkWord(word:string){
   
  this.httpClient.get(this.fileURL, { responseType: 'text' }).subscribe((res: any) => {
    let dictionary = this.spellCheckerService.getDictionary(res)
    
   this.suggestions =  dictionary.getSuggestions(word)
   })
 
 
    this.contextmenu = true
}

  addClass() {
    // centering new class position on creation
    const pos = this.graphService.viewCenter()
    this.vocabService.addClass(this.vocabID, this.createClassForm.controls['name'].value, this.createClassForm.controls['description'].value, this.createClassForm.controls['URI'].value, pos);
    this.createClassForm.reset()
    this._snackBar.open(SideBarNodeCreatorComponent.CLASS_ADD_MESSAGE, 'Close', {
      duration: 2000,
    });
    this.resetSidebarState()
  }

  autoCompleteURI($event) {
    this.createClassForm.controls['URI'].setValue(`${this.uriPrefix}${$event.target.value}`)
  }

  resetSidebarState() {
    this.sidebarService.changeSidebarToDefault()
  }
}
