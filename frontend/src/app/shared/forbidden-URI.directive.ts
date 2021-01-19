import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { VocabulariesService } from "../services/vocabularies.service";

  @Injectable({ providedIn: 'root' })
  export class duplicateURIValidator implements AsyncValidator {
    constructor(private vocabService: VocabulariesService) {}
  
    validate(
      ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
      return this.vocabService.isURITaken(ctrl.value,"class").pipe(
        map(isTaken => (isTaken ?  {invalidAsync: true} :null)),
        catchError(() => of(null))
      );
    }
  }