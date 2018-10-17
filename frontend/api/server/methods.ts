import { Meteor } from 'meteor/meteor';

import { Classes, Properties, Vocabularies } from '../collections';
import { meteorID } from '../models';

function assertUser() {
  if (!Meteor.userId()) {
    throw new Meteor.Error('unauthorized',
      'User must be logged-in to invoke this method');
  }
}

/**
 * Reminder: the arguments to call one of these methods on
 * MeteorObservable.call or similar, must have the exact same names as here.
 * They are not matched by order, but by name.
 */

Meteor.methods({
  'vocabulary.create'(name: string, description: string, uriPrefix: string) {
    assertUser();
    Vocabularies.insert({ name, authors: [this.userId], description, uriPrefix, classes: [] });
  },
  /*'vocabulary.insertClass'({id, vClass}) {
    Vocabularies.update({_id:id}, { $push: {classes: vClass}});
  },*/
  'vocabulary.remove'(vocabId: string) {
    assertUser();
    // TODO: Sanitize
    // currently: pseudo permission check via only being able to remove documents where the current user is also an author
    Vocabularies.remove({ _id: vocabId, authors: this.userId });
  },
  'class.create'(vocabId, name, description, URI) {
    assertUser();
    // TODO: Sanitize

    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const classIdO = Classes.insert({ name, description, URI, properties: [], position: { x: 0, y: 0 }, skos: { closeMatch: [], exactMatch: [] } });
    classIdO.subscribe((classID) =>
      Vocabularies.update({ _id: vocabId }, { $push: { classes: classID } })
    );
  },
  'class.update.name'(classID: string, name: string) {
    assertUser();
    Classes.update(
      { _id: classID },
      { $set: { name } },
      {}
    );
  },
  'class.update.description'(classID: string, description: string) {
    assertUser();
    Classes.update(
      { _id: classID },
      { $set: { description } },
      {}
    );
  },
  'class.update.URI'(classID: string, URI: string) {
    assertUser();
    Classes.update(
      { _id: classID },
      { $set: { URI } },
      {}
    );
  },
  'classes.translate'(classids: string[], dx: number, dy: number) {
    assertUser();
    // TODO: Sanitize
    Classes.update(
      { _id: { $in: classids } },
      { $inc: { 'position.x': dx, 'position.y': dy } },
      { multi: true }
    );
  },
  'property.create'(classId, name, description, URI, range) {
    assertUser();
    // TODO: Sanitize
    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const propID = Properties.insert({ name, description, URI, range });
    propID.subscribe((pID) =>
      Classes.update({ _id: classId }, { $push: { properties: pID } })
    );
  },

});
