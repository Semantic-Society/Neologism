import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {RecommendationService} from '../services/recommendation.service';
import {SideBarStateService} from '../services/state-services/sidebar-state.service';
import {VocabulariesService} from '../services/vocabularies.service';

interface IClassRecommendation {
  uri: string;
  comment: string;
  label: string;
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
}

interface IPropertyRecommendation {
  uri: string;
  comment: string;
  label: string;
  range: string;
}

@Component({
    selector: 'app-recommender',
    templateUrl: './recommender.component.html',
    styleUrls: ['./recommender.component.css'],
})
export class RecommenderComponent implements OnInit {
    // TODO (189) REFACTOR THIS

    // TODO (189) MC: I don't know a better way to ensure that an old finishing request does not turn of the spinner OR fills the results.
    // TODO (189) before it was be possible that an old, still pending request which returns turns off the spinner or fills the result list
   currentRequestNumber = 0;

  @Input() vocabID: string;

  constructor(
     private recommendationService: RecommendationService,
     private vocabService: VocabulariesService,
     private sidebarService: SideBarStateService) {
  }

  @ViewChild('labelInput', {static: true}) labelInput: ElementRef;

  public showSpinner = false;
   showSpinnerProp = false;
   noPropertiesFound = false;
  recommendations: IClassRecommendation[] = [];
  selectedRecommendation: IClassRecommendation;
  isSelectedRecommendationVisible = false;
  propertyRecommendations: IPropertyRecommendation[] = [];

  ngOnInit() {
      this.selectLabelInput();
  }

  selectLabelInput() {
      const labelField = this.labelInput.nativeElement as HTMLInputElement;
      // labelField.value = this.inputLabel; // Workaround hack to preselect the input field text
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
          if (!(queryString)) {
              throw new Error('labelFiled null');
          }

          this.recommendationService.classRecommendationforNewClass(''/*context*/, queryString)
              .subscribe(
                  (recs) => {
                      if (this.currentRequestNumber === requestNumber) {
                          this.recommendations = recs;
                      }
                  }, (error) =>{
                    console.log(error)
                  } 
                  , () => {
                      if (this.currentRequestNumber === requestNumber) {
                          this.disableSpinner();
                      }
                  }
              );
      };
      exp();
      /*
    this.onInputLabelUpdated.emit(labelField.value);
    console.log("input typing event fired! New label name "+ labelField.value);*/
  }

  selectRecommendation(r: IClassRecommendation) {
      // console.log('Send request');
      this.enableSpinnerProp();
      this.selectedRecommendation = r;
      this.isSelectedRecommendationVisible = true;
      this.recommendationService.propertyRecommendation(r.uri)
          .subscribe((res) => {
              this.propertyRecommendations = res;
              // console.log('Received Property Recommendation', res);

          }, () => {
              console.log('request failed');
          }
          , () => {
              console.log('request finished');
              this.disableSpinnerProp();
              if (this.propertyRecommendations === []) {
                  this.noPropertiesFound = false;
              }
          });
  }

  addToGraph() {
      this.vocabService.addClass(this.vocabID, this.selectedRecommendation.label, this.selectedRecommendation.comment, this.selectedRecommendation.uri).subscribe((res) => '');
  }

  enableSpinner() {
      this.showSpinner = true;
  }

  disableSpinner() {
      this.showSpinner = false;
  }

  enableSpinnerProp() {
      this.showSpinnerProp = true;
  }

  disableSpinnerProp() {
      this.showSpinnerProp = false;
  }

  resetSidebarState() {
      this.sidebarService.changeSidebarToDefault();
  }
}
