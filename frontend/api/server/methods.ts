import { Classes, Vocabularies } from '../collections';
import { meteorID } from '../models';

/**
 * Reminder: the arguments to call one of these methods on
 * MeteorObservable.call or similar, must have the exact same names as here.
 * They are not matched by order, but by name.
 */

Meteor.methods({
  'vocabulary.create'({ name, authors, description, uriPrefix }) {
    Vocabularies.insert({ name, authors, description, uriPrefix, classes: [] });
  },
  /*'vocabulary.insertClass'({id, vClass}) {
    Vocabularies.update({_id:id}, { $push: {classes: vClass}});
  },*/
  'vocabulary.remove'(vocabId: string) {
    // TODO: Sanitize
    Vocabularies.remove(vocabId);
  },
  'class.create'({ vocabId, name, description, URI }) {
    // TODO: Sanitize
    // const classId = Classes.insert({ name, description, URI, properties: [], position: { x: 0, y: 0 }, skos: { closeMatch: [], exactMatch: [] } });
    // Vocabularies.update({ _id: vocabId }, { $push: { classes: classId } });

    // TODO: is the following implmentation any better:

    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const classIdO = Classes.insert({ name, description, URI, properties: [], position: { x: 0, y: 0 }, skos: { closeMatch: [], exactMatch: [] } });
    const subscription = classIdO.flatMap((theID) => {
      subscription.unsubscribe();
      return Vocabularies.update({ _id: vocabId }, { $push: { classes: theID } });
    }).subscribe();

  },

});
