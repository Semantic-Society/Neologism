import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @Input() inputValue:string;
  @ViewChild('labelInput') labelInput: ElementRef;

  constructor() { }

  ngOnInit() {
    this.selectLabelInput();
  }
  selectLabelInput(){
    const labelField = <HTMLInputElement>this.labelInput.nativeElement;
    labelField.value=this.inputValue; //Workaround hack to preselect the input field text
                                      //since the value is not set immediately by angular before labelField.select
    labelField.select();
  }

}
