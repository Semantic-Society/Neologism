import {Vocabularies} from "../collections";

Meteor.methods({
  'vocabulary.create'({ name, authors, description, uriPrefix }) {
    Vocabularies.insert({
      name: name,
      authors: authors,
      description: description,
      uriPrefix: uriPrefix
    });
  }
});
