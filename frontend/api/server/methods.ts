import {Vocabularies} from "../collections";

Meteor.methods({
  'vocabulary.create'({ name }) {
    Vocabularies.insert({name: name});
  }
});
