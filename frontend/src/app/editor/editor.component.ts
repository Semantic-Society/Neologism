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
  @Output() onInputLabelUpdated: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('labelInput') labelInput: ElementRef;

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
    const labelField = <HTMLInputElement>this.labelInput.nativeElement;
    this.onInputLabelUpdated.emit(labelField.value);
    console.log("input typing event fired! New label name "+ labelField.value);
}



}
