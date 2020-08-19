import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';

@Injectable()
export class LoginAuthGuard implements CanActivate {
  constructor( private router: Router) {}

  canActivate(): boolean {
    //check if user currently is logged in
    let loggedIn: boolean = (Meteor.userId()) ? true : false;

    if (loggedIn) {
      this.router.navigate(['/dashboard']);
    }

    return loggedIn;
  }
}