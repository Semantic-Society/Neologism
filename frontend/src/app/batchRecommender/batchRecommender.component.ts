import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { debounceTime, startWith } from "rxjs/operators";
import { BatchRecommendations } from "../services/BatchRecommendations";
import { RecommendationService } from "../services/recommendation.service";
import {
  IClassWithProperties,
  VocabulariesService,
} from "../services/vocabularies.service";

@Component({
  selector: "app-batchRecommender",
  templateUrl: "./batchRecommender.component.html",
  styleUrls: ["./batchRecommender.component.css"],
})
export class BatchRecommenderComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  radioSelected: Array<any>;
  @Input() recommendations: Observable<BatchRecommendations[]>;
  @Input() classes: Observable<IClassWithProperties[]>;
  chosen: string[];
  propertyNames: string[];

  constructor(private vocabService: VocabulariesService) {}

  ngOnInit() {
    this.radioSelected = new Array();
  }

  ngOnDestroy() {}

  radioFun() {
    console.log(this.radioSelected);
    console.log(this.classes);
  }

  test() {
    this.classes.forEach((cs) => {
      this.recommendations.forEach((recs) => {
        recs.forEach((rec, i) => {
          cs.forEach((c) => {
            if (rec.keyword === c.name) {
              let element = rec.list.find(
                (r) => r.URI === this.radioSelected[i]
              );
              if (element) {
                this.vocabService.updateClassName(c._id, element.labels[0]);

                element.comments[0]
                  ? this.vocabService.updateClassDescription(
                      c._id,
                      element.comments[0]
                    )
                  : null;

                this.vocabService.updateClassURI(c._id, element.URI);
              }
              console.log("Class", c._id, rec.keyword, this.radioSelected[i]);
            }

            //TODO Update property and check comment provided - show something for no recommendation results
            c.properties.forEach((p) => {
              if (rec.keyword === p.name) {
                console.log(
                  "Property",
                  rec.keyword,
                  this.radioSelected[i],
                  p._id
                );
              }
            });
          });
        });
      });
    });
  }
}
