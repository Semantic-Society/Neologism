import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Observable, Observer } from 'rxjs';

/**
 * A service to use as auth guard on the route.
 *
 */
// eslint-disable-next-line max-classes-per-file

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            Tracker.autorun((c) => {
                if (!Meteor.loggingIn()) {
                    observer.next(!!Meteor.user());
                    observer.complete();
                    c.stop();
                }
            });
        });
    }
}
