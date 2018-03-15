import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @Input() inputLabel:string;
  @Input() inputIdentifier:string;
  @Input() inputDescription:string;
  @Input() inputProperties:any;
  //@Input() recommendations:any;
  @Output() onInputLabelUpdated: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('labelInput') labelInput: ElementRef;
  recommendations = []
  showSpinner:Boolean = false;
  constructor() { }

  ngOnInit() {
    this.selectLabelInput();
  }
  selectLabelInput(){
    const labelField = <HTMLInputElement>this.labelInput.nativeElement;
    labelField.value=this.inputLabel; //Workaround hack to preselect the input field text
                                      //since the value is not set immediately by angular before labelField.select
    labelField.select();
  }
  /*public sendInputLabel():void{
    console.log("input typing event fired!");
    const labelField = <HTMLInputElement>this.labelInput.nativeElement;
    this.onInputLabelUpdated.emit(labelField.value);
    console.log(labelField.value);

  }*/

  public sendInputLabel(): void {
    this.recommendations = [];
    setTimeout(()=>{  this.recommendations = ["dcat:Catalog", "dcatap-it:Catalog", "dcatap-nl:Catalog", "someother:Catalog"]}, 2000)

    this.enableSpinner();
    const labelField = <HTMLInputElement>this.labelInput.nativeElement;
    this.onInputLabelUpdated.emit(labelField.value);
    console.log("input typing event fired! New label name "+ labelField.value);
}
  enableSpinner(){
    this.showSpinner = true;
  }
  disableSpinner() {
    this.showSpinner = false;
  }



}
