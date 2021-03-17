import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MeteorObservable } from "meteor-rxjs";
import { Observable } from "rxjs";
import { debounceTime, startWith } from "rxjs/operators";
import { BatchRecommendations } from "../services/BatchRecommendations";
import { Recommendation } from "../services/Recommendation";
import {
  IClassWithProperties,
  VocabulariesService
} from "../services/vocabularies.service";

@Component({
  selector: "app-batchRecommender",
  templateUrl: "./batchRecommender.component.html",
  styleUrls: ["./batchRecommender.component.css"],
})
export class BatchRecommenderComponent implements OnInit, OnDestroy {
  radioSelected: Array<any>;
  @Input() recommendations: Observable<BatchRecommendations[]>;
  @Input() classes: Observable<IClassWithProperties[]>;
  chosen: string[];
  propertyNames: string[];

  constructor(private vocabService: VocabulariesService) { }

  ngOnInit() {
    this.radioSelected = new Array();
  }

  ngOnDestroy() { }

  preselect(URI: string, index: number) {
    if(!this.radioSelected[index]){
      this.radioSelected[index] = URI;
  }
  }
  preselectNone(index:number){
      this.radioSelected[index] = "None_"+index;
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

                    this.vocabService.updateClassDescription(c._id, classNameAndDescription[1]);
                    this.vocabService.updateClassName(c._id, classNameAndDescription[0] === "" ? rec.keyword : classNameAndDescription[0]);
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
