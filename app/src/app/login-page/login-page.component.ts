import { Component, OnInit, NgZone } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  public username: string;
  public password: string;
  public password2: string;

  createBasicErrorMessage(text: string, type: string = 'error'): void {
    this.message.create(type, text);
  }

  login() {
    Meteor.loginWithPassword(this.username, this.password, (error) => {
      this.zone.run(() => {
        if (error) {
          this.createBasicErrorMessage('Login Failed! Please check your credentials');
        } else {
          this.router.navigateByUrl('/dashboard')
        }
      })

    });
  }

  guestLogin() {
    Meteor.loginWithPassword(environment.guestUserName, environment.guestPassword, (error) => {
      this.zone.run(() => {
        if (error) {
          this.createBasicErrorMessage('Login Failed! Please check your credentials');
        } else {
          this.router.navigateByUrl('/dashboard')
        }
      })

    });
  }

  signUp(): void {
    // User registration disabled for live server

    if (this.username !== '') {

      if (this.password === this.password2) {
        Accounts.createUser({ email: this.username, password: this.password }, (error) => {
          if (error) {
            if (error.message === "Signups forbidden [403]") {
              this.createBasicErrorMessage('Sorry! User creation is disabled')
            } else {
              this.createBasicErrorMessage('Sorry! User creation failed...')
            }
            return;
          }
          this.createBasicErrorMessage('Success! Your account was successfully created', 'success')

        });
      } else {
        this.createBasicErrorMessage('Your passwords are not identical')
      }
    } else {
      this.createBasicErrorMessage('Please enter an email address!')
    }
  }

  constructor(private message: NzMessageService, private router: Router, private zone: NgZone) {

  }

}
