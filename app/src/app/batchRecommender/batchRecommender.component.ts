import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { IClassWithProperties } from '../../../api/models';
import { BatchRecommendations } from '../services/BatchRecommendations';
import { Recommendation } from '../services/Recommendation';
import {
    VocabulariesService
} from '../services/vocabularies.service';
@Component({
    selector: 'app-batchRecommender',
    templateUrl: './batchRecommender.component.html',
    styleUrls: ['./batchRecommender.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchRecommenderComponent implements OnInit {
  radioSelected: any[];
  @Input() recommendations$: Observable<BatchRecommendations[]>;
  @Input() classes: Observable<IClassWithProperties[]>;
  chosen: string[];
  propertyNames: string[];
  loaded: boolean;

  constructor(private vocabService: VocabulariesService, private changeDedectionRef: ChangeDetectorRef) {
      this.loaded = false;
  }

  ngOnInit() {
      this.radioSelected = [];
  }
  dataLoaded() {
      this.loaded = true;
  }
  return() {
      this.loaded = false;
  }

  ngAfterContentChecked(): void {
      this.changeDedectionRef.detectChanges();
  }
  preselect(URI: string, index: number) {
      if (!this.radioSelected[index]) {
          this.radioSelected[index] = URI;
      }
  }
  preselectNone(index: number) {
      this.radioSelected[index] = 'None_' + index;
  }

  liftOntology() {
      this.loaded = false;
      this.recommendations$
          .pipe(startWith([]), debounceTime(1000))
          .subscribe((recs) => {
              this.classes
                  .pipe(startWith([]), debounceTime(1000))
                  .subscribe((cs: IClassWithProperties[]) => {
                      recs.forEach((rec, i) => {
                          cs.forEach((c) => {
                              if (rec.keyword === c.name) {
                                  const element = rec.list.find(
                                      (r) => r.URI === this.radioSelected[i]
                                  );

                                  if (element) {
                                      const classNameAndDescription = this.getNameAndDescription(
                                          element
                                      );

                                      this.vocabService.updateClassDescription(c._id, classNameAndDescription[1]);
                                      this.vocabService.updateClassName(c._id, classNameAndDescription[0] === '' ? rec.keyword : classNameAndDescription[0]);
                                      this.vocabService.updateClassURI(c._id, element.URI);

                                  }
                              }

                              c.properties.forEach((p) => {
                                  if (rec.keyword === p.name) {
                                      const element = rec.list.find(
                                          (r) => r.URI === this.radioSelected[i]
                                      );

                                      if (element) {
                                          const classNameAndDescription = this.getNameAndDescription(
                                              element
                                          );
                                          MeteorObservable.call(
                                              'property.update',
                                              p._id,
                                              classNameAndDescription[0] === ''
                                                  ? rec.keyword
                                                  : classNameAndDescription[0],
                                              classNameAndDescription[1],
                                              element.URI,
                                              p.range._id
                                          ).subscribe(
                                              (response) => {
                                                  // Handle success and response from server!
                                                  console.log('properties lifted');
                                              },
                                              (err) => {
                                                  console.log(err);
                                              }
                                          );
                                      }
                                  }
                              });
                          });
                      });
                  });
          });
  }

  private getNameAndDescription(element: Recommendation) {
      const regexBold = new RegExp('<\/?b>', 'g');
      const name = element.labels[0]
          ? element.labels[0].label.replace(regexBold, '')
          : '';
      const description = element.comments[0]
          ? element.comments[0].label.replace(regexBold, '')
          : '';

      return [name, description];
  }
}
