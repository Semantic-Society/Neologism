import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/map';
import { RecommendationService } from '../services/recommendation.service';
import { MxgraphService } from '../mxgraph/mxgraph';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {

    constructor(private recommendationService: RecommendationService) { }

    @Input() inputLabel: string;
    @Input() inputIdentifier: string;
    @Input() inputDescription: string;
    @Input() inputProperties: any;
    //@Input() recommendations:any;
    @Output() onInputLabelUpdated: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('labelInput') labelInput: ElementRef;
    recommendations = [];
    showSpinner: Boolean = false;
    ngOnInit() {
        this.selectLabelInput();
    }
    selectLabelInput() {
        const labelField = <HTMLInputElement>this.labelInput.nativeElement;
        labelField.value = this.inputLabel; //Workaround hack to preselect the input field text
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
        // setTimeout(()=>{  this.recommendations = ["dcat:Catalog", "dcatap-it:Catalog", "dcatap-nl:Catalog", "someother:Catalog"]}, 2000)

        this.enableSpinner();

        const labelField = (this.labelInput.nativeElement as HTMLInputElement).value;
        const mx: MxgraphService = window['mxgraphService'];
        if (mx && labelField)
            mx.serializeModel().then((model) => {
                this.recommendationService.classRecommendation(model, labelField)
                    .subscribe((recs) => {
                        console.log(recs);
                        recs.forEach(function(value){
                          console.log("=======");
                          console.log(value);
                          if(value["list"])
                            value["list"].forEach(function(singleRecommendation){

                              this.recommendations.push({uri: singleRecommendation.uri, comment: singleRecommendation.comments[0].label, label:singleRecommendation.labels[0].label});
                              console.log(this.recommendations);
                            });
                          }

                        );
                        this.recommendations = recs;
                        //console.log(recs);
                    });
            });
        /*
        this.onInputLabelUpdated.emit(labelField.value);
        console.log("input typing event fired! New label name "+ labelField.value);*/
    }
    enableSpinner() {
        this.showSpinner = true;
    }
    disableSpinner() {
        this.showSpinner = false;
    }
    getRecommendations() {

    }



}
