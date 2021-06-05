import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthGuard } from './annotations';
import { LoginButtons } from './loginButton/login-buttons';
import { LoginDialog } from './loginDialog/login-dialog';
import { SignupDialog } from './signupDialog/signup-dialog';
import { ValidationService } from './validation.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    BrowserAnimationsModule
  ],
  // entryComponents: [LoginButtons, LoginDialog, SignupDialog],
  declarations: [
    LoginButtons,
    LoginDialog,
    SignupDialog
  ],
  providers: [
    AuthGuard,
    ValidationService
  ],
  exports: [
    LoginButtons
  ]
})
export class AccountsModule {
}
