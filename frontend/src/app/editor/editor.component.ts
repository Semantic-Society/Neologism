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
                        recs.forEach((value) => {
                          this.recommendations = [];
                          if(value.list)
                            for (var i =0; i<=3; i++) {
                              var label = "";
                              var comment ="";
                              if(value.list[i]){
                                if (value.list[i].comments[0]) {
                                  comment = value.list[i].comments[0].label;
                                }

                                if (value.list[i].labels[0]) {
                                  label = value.list[i].labels[0].label;
                                }

                                //console.log("====",{uri: value.list[i].uri, comment: comment, label: label});
                                this.recommendations.push({uri: value.list[i].URI, comment: comment, label: label});
                              }

                            }

                          }

                        );
                        //this.recommendations = recs;
                        //console.log(recs);
                    });
            });
            this.disableSpinner();
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
