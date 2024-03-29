import {Meteor} from 'meteor/meteor';

import {combineLatest} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';

import {Classes, Properties, Users, Vocabularies} from '../collections';
import {publishVocabulary} from './helper';

// should be refactored as well. The checck is not sufficient
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

function addTimeStamp(data){
  return {
    ...data,
    createdOn:Date.now()
  }
}

Meteor.methods({
  // get user by email, needed to add users by email, collaboration feature
  'users-without-self.get'(email: string) {
    assertUser();

    const re = new RegExp(this.userId);
    return Users.find({
        'emails.address': {$regex: email},
        '_id': {$not: re},
      },
      {limit: 10}).fetch();
  },
  'vocabulary.assign-creator.self'(vocabId: string) {
    assertUser();
    Vocabularies.update(
      { _id: vocabId },
      {
        $set: {
          creator: this.userId
        }
      }).subscribe((value) => console.log('assigned creator to vocabulary ' + vocabId + ' ' + value));
  },
  'vocabulary.addAuthors'(authorIds: string[], vocabId: string) {
    assertUser();

    Vocabularies.update(
      { _id: vocabId, creator: this.userId },
      {
        $addToSet:
        {
          authors:
            { $each: authorIds }
        }
      }).subscribe((value) => console.log('added authors ' + value));
  },
  'vocabulary.removeAuthors'(authorIds: string[], vocabId: string) {
    assertUser();
    console.log(authorIds + ' ids');
    Vocabularies.update(
      { _id: vocabId, creator: this.userId },
      {
        $pull:
        {
          authors:
            { $in: authorIds }
        }
      }).subscribe((value) => console.log('removed authors' + value));
  },
  'vocabulary.addDomain'(domain: string, vocabId: string) {
    assertUser();

    Vocabularies.update(
      { _id: vocabId, creator: this.userId },
      {
        $set: {
          domain
        }
      }).subscribe((value) => console.log('added domain ' + domain + ' for' + value));
  },
  'vocabulary.create'(_id: string, name: string, description: string, uriPrefix: string, field_public: boolean = false, domain: string) {
    assertUser();
    // add user to array of users to enable multiple user access. Fixes should happen on a author/creator fiel as well

    return Vocabularies.insert({
      _id,
      creator: this.userId,
      name,
      authors: [],
      description,
      uriPrefix,
      public:
        field_public,
      classes: [],
      domain,
      createdAt: new Date().getTime()
    });

  },

  'vocabulary.remove'(vocabId: string) {
    assertUser();

    // currently: pseudo permission check via only being able to remove documents where the current user is also an author
    const vocab = Vocabularies.findOne({ _id: vocabId, creator: this.userId });
    Vocabularies.remove({ _id: vocabId, creator: this.userId });
    vocab.classes.forEach((classId) => {
      const classa = Classes.findOne({ _id: classId });
      Classes.remove({ _id: classId });
      classa.properties.forEach((propId) => {
        Properties.remove({ _id: propId });
      });
      Properties.remove({ range: classId });
    });

  },
  'vocabulary.publish'(rdfTtl: string, vocabId: string) {
    assertUser();
  
    publishVocabulary(rdfTtl, vocabId)
  },
  'class.create'(vocabId, vertexType, name, description, URI, position, _id) {
    assertUser();

    var classIdO
    // checking for Id indicates that it is a DataType Vertex
    // where the id for prop and vertex are identical
      classIdO = Classes.insert(addTimeStamp({
         _id, name, isDataTypeVertex: vertexType
      , description, URI, properties: [], position
      , skos: { closeMatch: [], exactMatch: [] } 
      }));

    classIdO.subscribe((classID) =>
      Vocabularies.update(
        { _id: vocabId },
        {
          $push:
            { classes: classID }
        })
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
  'class.update'(classID: string, URI: string, description: string, name: string) {
    assertUser();
    Classes.update(
      { _id: classID },
      { $set: { URI, description, name } },
      {}
    );
  },
  'classes.translate'(classids: string[], dx: number, dy: number) {
    assertUser();
  
    Classes.update(
      { _id: { $in: classids } },
      { $inc: { 'position.x': dx, 'position.y': dy } },
      { multi: true }
    );
  },
  'classes.delete'(classId: string) {
    assertUser();
    const $getClassProps = Classes.find({ _id: classId }, { limit: 1 }).pipe(map((classes) => classes[0].properties));
    const $getClassRangeProps = Properties.find({ range: classId }).pipe(map((props) => props.map((prop) => prop._id)));

    combineLatest([$getClassProps,
      $getClassRangeProps]
    )
      .pipe(
        take(1),
        tap(([x, y]) => console.log(x.concat(y))),
        map(([first, second]) => {
          first.concat(second)
            .forEach((propId) => Properties.remove(propId));
          return true;
        })
      ).subscribe((_resp) => Classes.remove(classId));

  },
  'property.create'(classId, payload) {
    assertUser();

    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const propID = Properties.insert(
      addTimeStamp({ ...payload }))
      ;
    propID.subscribe((pID) => {
      return Classes.update(
        { _id: classId },
        {
          $push: { properties: pID }
        });
    }
    );
  },
  'property.update'(id, name, description, URI, range) {
    assertUser();
    Properties.update(
      { _id: id },
      { $set: { name, description, URI, range } },
      {}
    );
  },
  'property.delete'(propId, sourceId) {
    assertUser();
    Classes.update(
      { _id: sourceId },
      { $pull: { properties: { $in: [propId] } } },
      {}
    ).subscribe();

    Properties.remove(
      { _id: propId }
    ).subscribe();
  }
});
