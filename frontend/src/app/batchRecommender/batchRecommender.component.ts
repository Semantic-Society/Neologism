import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from "rxjs";
import { BatchRecommendations } from "../services/BatchRecommendations";
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

  liftOntology() {
    this.classes.forEach((cs) => {
      this.recommendations.forEach((recs) => {
        recs.forEach((rec, i) => {
          cs.forEach((c) => {
            if (rec.keyword === c.name) {
              let element = rec.list.find(
                (r) => r.URI === this.radioSelected[i]
              );
              console.log(element);
              if (element) {
                console.log("ok", element);

                element.labels[0]
                  ? this.vocabService.updateClassName(
                      c._id,
                      element.labels[0].label
                    )
                  : null;

                element.comments[0]
                  ? this.vocabService.updateClassDescription(
                      c._id,
                      element.comments[0].label
                    )
                  : null;

                this.vocabService.updateClassURI(c._id, element.URI);
              }
            }

            //TODO Show something for no recommendation results & cancel Button
            c.properties.forEach((p) => {
              if (rec.keyword === p.name) {
                let element = rec.list.find(
                  (r) => r.URI === this.radioSelected[i]
                );
                if (element) {
                  MeteorObservable.call(
                    "property.update",
                    p._id,
                    element.labels[0] ? element.labels[0].label : rec.keyword,
                    element.comments[0] ? element.comments[0].label : "",
                    element.URI,
                    p.range
                  ).subscribe(
                    (response) => {
                      // Handle success and response from server!
                      console.log("updated");
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
}
