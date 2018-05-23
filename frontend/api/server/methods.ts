import { Vocabularies } from '../collections';

Meteor.methods({
  'vocabulary.create'({ name, authors, description, uriPrefix }) {
    Vocabularies.insert({ name, authors, description, uriPrefix });
  },
  'vocabulary.remove'(vocabId: string) {
    // TODO: Sanitize
    Vocabularies.remove(vocabId);
  }
});
