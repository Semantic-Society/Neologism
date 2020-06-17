# Frontend

## Installation

### Native Installation

1. Clone the repository
2. Install meteor using `curl https://install.meteor.com/ | sh`
3. Run npm install in the `frontend` folder
4. Run the meteor bundler (see below)

### Docker Installation (from within the frontend folder)

1. `docker-compose build`
2. `docker-compose run`
3. On host: `npm install`, `npm run meteor-client:bundle`, then `npm run start`

## Development server

Initially & every time you make a change to the server code (which affects the client side code), rebundle the meteor client side code by running `npm run meteor-client:bundle`.

Run `npm run api` to start a local meteor server (running on `http://localhost:3000/` with a connection to a local mongodb at port `3001`).
Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `npm run build-prod` for a production build with AOT.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Find detail for the Angular/Meteor integration here: https://github.com/Urigo/angular-meteor/tree/master/examples/AngularCLI
