import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {Observable, of, timer} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

export function uriPropValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => timer(500).pipe(
        switchMap((_) => this.isURITaken(control.value, 'property')),
        map((isTaken) => (isTaken ? { invalidURI: true } : null)),
        catchError(() => of(null)));
}

export function transformURI(text) {
    // text = text.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    // return text.substr(0, 1).toUpperCase() + text.substr(1);
    text = text.replace(/\s/g, ""); // Removes leading and trailing spaces
    return text;
}


