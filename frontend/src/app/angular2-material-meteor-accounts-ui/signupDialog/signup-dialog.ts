import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ValidationService } from '../validation.service';

// import signupDialogHtml from './signup-dialog.html';
// import signupDialogCss from './signup-dialog.css';

@Component({
    selector: 'signup-dialog',
    template: `
    <h1 mat-dialog-title>Signup form :</h1>
    <form [formGroup]="signupForm"  (ngSubmit)="onSignupFormSubmit()">
        <div mat-dialog-content>

            <div class="error-message mat-elevation-z12 mat-background-warn" *ngIf="errorMessage">
                <mat-icon color="warning">warning</mat-icon> {{ errorMessage }}
            </div>

            <mat-form-field>
                <input matInput  placeholder="Your e-mail" type="text" formControlName="email">
            </mat-form-field>
            <mat-form-field>
                <input matInput  placeholder="Your password" type="password" formControlName="password">
            </mat-form-field>
        </div>
    <div mat-dialog-actions>
        <a mat-button (click)="onNoClick()" action="cancel">Exit</a>
        <button mat-raised-button color="primary" action="submit">Sign up</button>
    </div>
    </form>`,
    styles: [`
    .error-message {
      margin: 20px 0px;
      padding: 5px;
      border: solid 2px #ff5722;
      color: #ff5722;
    }`]
})

export class SignupDialog implements OnInit {
    public signupForm: FormGroup;
    public errorMessage: string = null;

    constructor(
        public dialogRef: MatDialogRef<SignupDialog>,
        private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            email: ['', [Validators.required, ValidationService.emailValidator]],
            password: ['', Validators.required]
        });
    }

    sendErrorMessage(message): void {
        this.errorMessage = message;

        setTimeout(() => {
            this.errorMessage = null;
        }, 5000);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSignupFormSubmit(): void {
        if (this.signupForm.valid) {
            // The callback is not called in exterior because this change.
            // Also I don't know how call local function
            Accounts.createUser({ email: this.signupForm.value.email, password: this.signupForm.value.password }, (error) => {
                console.log(this);
                if (error) {
                    this.sendErrorMessage(error.reason || 'Unknown error');
                } else {
                    this.dialogRef.close();
                }
            });
        } else {
            this.sendErrorMessage('Merci de remplir correctement les champs en demandé');
        }
    }
}
