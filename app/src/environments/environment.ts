// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    recommender: {
        base: 'http://localhost',
        port: '80',
    },
    guestUserName: window['env']['guser'] || 'guest',
    guestPassword: window['env']['gpass'] || '12345',
    gMaxVocab: window['env']['gMaxlength'] || '5'
};
