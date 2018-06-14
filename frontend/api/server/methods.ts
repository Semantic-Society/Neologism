import { Classes, Vocabularies, Properties } from '../collections';
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

    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const classIdO = Classes.insert({ name, description, URI, properties: [], position: { x: 0, y: 0 }, skos: { closeMatch: [], exactMatch: [] } });
    classIdO.subscribe((classID) =>
      Vocabularies.update({ _id: vocabId }, { $push: { classes: classID } })
    );
  },
  'classes.translate'( classids: string[], dx: number, dy: number ) {
    // TODO: Sanitize
    Classes.update(
      { _id: { $in: classids } },
      { $inc: { 'position.x': dx, 'position.y': dy } },
      { multi: true }
    );
  },
  'property.create'({ classId, name, description, URI, range }) {
    // TODO: Sanitize
    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const propID = Properties.insert({ name, description, URI, range });
    propID.subscribe((pID) =>
      Classes.update({ _id: classId }, { $push: { properties: pID } })
    );
  },

});
