import { Directive } from '@angular/core';
import { NG_VALIDATORS, ValidatorFn, Validator, FormControl } from '@angular/forms';
import { uriPropValidator } from './validator.dup.URI';




@Directive({
    selector: '[dupURI][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: DupURIValidator, multi: true }
    ]
})
export class DupURIValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = uriPropValidator();
    }

    validate(c: FormControl) {
        console.log(c.value);
        return this.validator(c);
    }

}
