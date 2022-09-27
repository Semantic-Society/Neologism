import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor( private router: Router) {}

    canActivate(): boolean {
        const canActivate: boolean = !!(Meteor.userId());

        if (!canActivate) {
            this.router.navigate(['/login']);
        }

        return canActivate;
    }
}
