import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  
  myStyle: object = {};
	myParams: object = {};
	width: number = 100;
  height: number = 100;
  
  public username: string;
  public password: string;
  public password2: string;

  ngOnInit() {

    this.myStyle = {
        'position': 'fixed',
        'width': '100%',
        'height': '100%',
        'z-index': 100  ,
        'top': 0,
        'left': 0,
        'right': 0,
        'bottom': 0,
    };

    this.myParams = {
      particles: {
        number: {
            value: 120,
        },
        color: {
            value: '#fff'
        },
        shape: {
            type: 'polydon',
        },
      }
    };

  }

  createBasicErrorMessage(text: string, type: string = 'error'): void {
    this.message.create(type, text);
  }

  login(){
    Meteor.loginWithPassword(this.username, this.password, (error) => {
      if (error) {
          this.createBasicErrorMessage('Login Failed! Please check your credentials');
      } else {
          this.router.navigateByUrl('/dashboard')
      }
    });
  }

  signUp(): void {
    // User registration disabled for live server

     if (this.username !== '') {
      
       if(this.password === this.password2) {
         Accounts.createUser({ email: this.username, password: this.password }, (error) => {
             if (error) {
               this.createBasicErrorMessage('Sorry! User creation failed...')
             } else {
               this.createBasicErrorMessage('Success! Your account was successfully created', 'success')
             }
         });
       } else {
         this.createBasicErrorMessage('Your passwords are not identical')
       }
     } else {
         this.createBasicErrorMessage('Please enter an email address!')
     }
  }

  constructor(private message: NzMessageService, private router: Router){

  }

}
