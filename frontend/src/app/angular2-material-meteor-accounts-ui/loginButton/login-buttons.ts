import { Component, NgZone } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import {LoginDialog} from '../loginDialog/login-dialog';
import {SignupDialog} from '../signupDialog/signup-dialog';

@Component({
  selector: 'login-buttons',
  template: `<button mat-raised-button color="accent" *ngIf="!isLoggedIn" (click)="onLoginDialogAsked()">Login</button>
  <button mat-button color="accent" *ngIf="!isLoggedIn" (click)="onSignupDialogAsked()">SignUp</button>

  <button mat-button class="user-menu--button"[matMenuTriggerFor]="userMenu" *ngIf="isLoggedIn">{{ displayName() }} <mat-icon>person</mat-icon></button>

  <mat-menu #userMenu="matMenu">
      <button mat-menu-item (click)="onLogout()">
          <mat-icon>power_setting_new</mat-icon>
          <span>Log out</span>
      </button>
  </mat-menu>`

})
export class LoginButtons {
  autorunComputation: Tracker.Computation;
  currentUser: Meteor.User;
  currentUserId: string;
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  isSignup: boolean;

  constructor(public dialog: MatDialog, private zone: NgZone) {
    this._initAutorun();
    this.isSignup = false;
  }

  displayName(): string {
    const user: any = this.currentUser;

    if (!user)
      return '';

    if (user.profile && user.profile.name)
      return user.profile.name;

    if (user.username)
      return user.username;

    if (user.emails && user.emails[0] && user.emails[0].address)
      return user.emails[0].address;

    return '';
  }

  onLogout(): void {
    Meteor.logout();
  }

  _initAutorun(): void {
    this.autorunComputation = Tracker.autorun(() => {
      this.zone.run(() => {
        this.currentUser = Meteor.user();
        this.currentUserId = Meteor.userId();
        this.isLoggingIn = Meteor.loggingIn();
        this.isLoggedIn = !!Meteor.user();
      });
    });
  }

    onLoginDialogAsked(): void {

        const dialogRef = this.dialog.open(LoginDialog, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe((result) => {
            // Do nothing when logged
        });
    }

    onSignupDialogAsked(): void {

        const dialogRef = this.dialog.open(SignupDialog, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe((result) => {
          // Do nothing when signed
        });
    }
}
