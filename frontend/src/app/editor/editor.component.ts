import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/map';
import { MxgraphService } from '../mxgraph/mxgraph';
import { RecommendationService } from '../services/recommendation.service';

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

    // TODO MC: I don't know a better way to ensure that an old finishing request does not turn of the spinner OR fills the results.
    // TODO before it was be possible that an old, still pending request which returns turns off the spinner or fills the result list
    private currentRequestNumber = 0;

    constructor(private recommendationService: RecommendationService) { }

    @Input() inputLabel: string;
    @Input() inputIdentifier: string;
    @Input() inputDescription: string;
    @Input() inputProperties: any;
    @Output() onInputLabelUpdated: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('labelInput') labelInput: ElementRef;

    private showSpinner = false;
    recommendations: IClassRecommendation[] = [];
    selectedRecommendation: IClassRecommendation;
    isSelectedRecommendationVisible = false;
    propertyRecommendations: IPropertyRecommendation[] = [];

    ngOnInit() {
        this.selectLabelInput();
    }
    selectLabelInput() {
        const labelField = this.labelInput.nativeElement as HTMLInputElement;
        labelField.value = this.inputLabel; // Workaround hack to preselect the input field text
        // since the value is not set immediately by angular before labelField.select
        labelField.select();
    }

    public sendInputLabel(): void {
        this.recommendations = [];
        this.isSelectedRecommendationVisible = false;
        const queryString: string = (this.labelInput.nativeElement as HTMLInputElement).value;
        if (queryString === '') {
            return;
        }
        const exp = () => {
            this.currentRequestNumber++;
            const requestNumber = this.currentRequestNumber;
            this.enableSpinner();
            const mx: MxgraphService = window['mxgraphService'];
            if (!(mx && queryString)) {
                throw new Error('mx or labelFiled null');
            }
            mx.serializeModel().then((model) =>
                this.recommendationService.classRecommendationforNewClass(model, queryString)
                    .subscribe(
                        (recs) => {
                            if (this.currentRequestNumber === requestNumber) {
                                this.recommendations = recs;
                            }
                        }, null // TODO handle error?
                        , () => {
                            if (this.currentRequestNumber === requestNumber) {
                                this.disableSpinner();
                            }
                        }
                    ));
        };
        exp();
        /*
        this.onInputLabelUpdated.emit(labelField.value);
        console.log("input typing event fired! New label name "+ labelField.value);*/
    }

    selectRecommendation(r: IClassRecommendation) {
        this.selectedRecommendation = r;
        this.isSelectedRecommendationVisible = true;
        this.recommendationService.propertyRecommendation(r.uri, r.creator)
            .subscribe((res) => { this.propertyRecommendations = res; console.log('Received Property Recommendation', res); });
    }

    addToGraph() {
        const mx: MxgraphService = window['mxgraphService'];
        mx.insertClass(this.selectedRecommendation.uri, this.selectedRecommendation.label, this.selectedRecommendation.creator);
        mx.selectClass(this.selectedRecommendation.uri);
    }

    enableSpinner() {
        this.showSpinner = true;
    }
    disableSpinner() {
        this.showSpinner = false;
    }
}
