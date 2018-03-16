import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/map';
import { RecommendationService, IPropertyRecommendation } from '../services/recommendation.service';
import { MxgraphService } from '../mxgraph/mxgraph';

interface IClassRecommendation {
    uri: string;
    comment: string;
    label: string;
    creator: string;
}
interface IPropertyRecommendation {
    uri: string;
    comment: string;
    label: string;
    range: string;
}

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
    // TODO REFACTOR THIS

    constructor(private recommendationService: RecommendationService) { }

    @Input() inputLabel: string;
    @Input() inputIdentifier: string;
    @Input() inputDescription: string;
    @Input() inputProperties: any;
    @Output() onInputLabelUpdated: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('labelInput') labelInput: ElementRef;

    private recommendations: IClassRecommendation[] = [];
    private selectedRecommendation: IClassRecommendation;
    private propertyRecommendations: IPropertyRecommendation[] = [];
    private showSpinner = false;

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

        this.enableSpinner();

        const labelField = (this.labelInput.nativeElement as HTMLInputElement).value;
        const mx: MxgraphService = window['mxgraphService'];
        if (mx && labelField)
            mx.serializeModel().then((model) =>
                this.recommendationService.classRecommendation(model, labelField)
                    .subscribe((recs) => this.recommendations = recs));

        this.disableSpinner();
        /*
        this.onInputLabelUpdated.emit(labelField.value);
        console.log("input typing event fired! New label name "+ labelField.value);*/
    }

    selectRecommendation(r: IClassRecommendation) {
        this.selectedRecommendation = r;
        this.recommendationService.propertyRecommendation(r.uri, r.creator)
            .subscribe((res) => { this.propertyRecommendations = res; console.log('Received Property Recommendation', res); });
    }

    addToGraph() {
        const mx: MxgraphService = window['mxgraphService'];
        const vertex = mx.getOrAddVertex(this.selectedRecommendation.uri);
        mx.selectCells([vertex]);
    }


    enableSpinner() {
        this.showSpinner = true;
    }
    disableSpinner() {
        this.showSpinner = false;
    }
}
