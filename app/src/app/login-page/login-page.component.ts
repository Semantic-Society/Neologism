import { Component, OnInit, NgZone } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  id="particles-container";

  particlesOptions = {
    background: {
      color: {
        value: "#0d47a1"
      }
    },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "canvas",
    },
    particles: {
      color: {
        value: "#ffffff"
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1
      },
      collisions: {
        enable: true
      },
      move: {
        direction: "none",
        enable: true,
        outMode: "bounce",
        random: false,
        speed: 6,
        straight: false
      },
      number: {
        density: {
          enable: true,
          value_area: 800
        },
        value: 120
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "polydon"
      },
      size: {
        random: true,
        value: 5
      }
    },
    detectRetina: true
  };


  myStyle: object = {};
	myParams: object = {};

  
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
      this.zone.run(() => {
        if (error) {
          this.createBasicErrorMessage('Login Failed! Please check your credentials');
      } else {
          this.router.navigateByUrl('/dashboard')
      }
      })

    });
  }

  guestLogin(){
    console.log(environment.guestUserName)
    console.log(environment.guestPassword)
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

  constructor( private message: NzMessageService,  private router: Router,private zone: NgZone){

  }

}
