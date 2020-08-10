import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'
Meteor.startup(() => {
  // code to run on server at startup
  Accounts.config({
    forbidClientAccountCreation: true
  });
});
