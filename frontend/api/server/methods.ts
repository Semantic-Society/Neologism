import { Classes, Vocabularies } from '../collections';
import {meteorID} from '../models';

Meteor.methods({
  'vocabulary.create'({ name, authors, description, uriPrefix }) {
    Vocabularies.insert({ name, authors, description, uriPrefix, classes: [] });
  },
  'vocabulary.remove'(vocabId: string) {
    // TODO: Sanitize
    Vocabularies.remove(vocabId);
  },
  'classes.create'({name, description, URI}) {
    // TODO: Sanitize
    Classes.insert({name, description, URI, properties : [], position: {x: 0, y: 0}, skos: {closeMatch: [], exactMatch: []}});
  },

});
