import { forwardRef } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, flatMap, map, switchMap, take } from 'rxjs/operators';
import { combineLatest, empty, Observable, of, throwError, timer } from 'rxjs';


function uriValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return timer(500).pipe(
        switchMap(_ => this.isURITaken(control.value, "class")),
        map(isTaken => (isTaken ? { invalidURI: true } : null)),
        catchError(() => of(null)))
    }

  }

  export function uriPropValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return timer(500).pipe(
        switchMap(_ => this.isURITaken(control.value, "property")),
        map(isTaken => (isTaken ? { invalidURI: true } : null)),
        catchError(() => of(null)))
    }

  }


