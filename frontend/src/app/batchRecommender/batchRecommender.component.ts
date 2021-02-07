import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Iproperty } from "api/models";
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from "rxjs";
import { debounceTime, startWith } from "rxjs/operators";
import { BatchRecommendations } from "../services/BatchRecommendations";
import { Recommendation } from "../services/Recommendation";
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
    this.recommendations
      .pipe(startWith([]), debounceTime(1000))
      .subscribe((recs) => {
        this.classes
          .pipe(startWith([]), debounceTime(1000))
          .subscribe((cs: IClassWithProperties[]) => {
            recs.forEach((rec, i) => {
              cs.forEach((c) => {
                if (rec.keyword === c.name) {
                  let element = rec.list.find(
                    (r) => r.URI === this.radioSelected[i]
                  );

                  if (element) {
                    const classNameAndDescription = this.getNameAndDescription(
                      element
                    );
                    MeteorObservable.call(
                      "class.update",
                      c._id,
                      element.URI,
                      classNameAndDescription[1],
                      classNameAndDescription[0] === ""
                        ? rec.keyword
                        : rec.keyword
                    ).subscribe(
                      (response) => {
                        // Handle success and response from server!
                        console.log("classes lifted");
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                  }
                }

                //TODO Show something for no recommendation results & cancel Button
                c.properties.forEach((p) => {
                  if (rec.keyword === p.name) {
                    let element = rec.list.find(
                      (r) => r.URI === this.radioSelected[i]
                    );

                    if (element) {
                      const classNameAndDescription = this.getNameAndDescription(
                        element
                      );
                      MeteorObservable.call(
                        "property.update",
                        p._id,
                        classNameAndDescription[0] === ""
                          ? rec.keyword
                          : rec.keyword,
                        classNameAndDescription[1],
                        element.URI,
                        p.range._id
                      ).subscribe(
                        (response) => {
                          // Handle success and response from server!
                          console.log("properties lifted");
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
    const name = element.labels[0]
      ? element.labels[0].label.replace("<b>", "").replace("</b>", "")
      : "";
    const description = element.comments[0]
      ? element.comments[0].label.replace("<b>", "").replace("</b>", "")
      : "";

    return [name, description];
  }
}
