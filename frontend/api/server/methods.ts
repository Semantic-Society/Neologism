import { Meteor } from 'meteor/meteor';
import {JsonRoutes} from 'meteor/simple:json-routes'

import { Iclass, Iuser, Ivocabulary } from 'models'
import { combineLatest } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';


import { Classes, Properties, Vocabularies, Users } from '../collections';
import { meteorID } from '../models';

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



Meteor.methods({
  // get user by email, needed to add users by email, collaboration feature
  'users-without-self.get'(email: string) {
    assertUser()

    const re = new RegExp(this.userId);
    const users = Users.find({
      'emails.address': { $regex: email },
      _id: { $not: re },
    },
      { limit: 10 }).fetch()

    return users;
  },
  'vocabulary.assign-creator.self'(vocabId: string) {
    assertUser()
    Vocabularies.update(
      { _id: vocabId },
      {
        $set: {
          creator: this.userId
        }
      }).subscribe((value) => console.log("assigned creator to vocabulary " + vocabId + " " + value))
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
      }).subscribe((value) => console.log("added authors " + value))
  },
  'vocabulary.removeAuthors'(authorIds: string[], vocabId: string) {
    assertUser();
    console.log(authorIds + " ids")
    Vocabularies.update(
      { _id: vocabId, creator: this.userId },
      {
        $pull:
        {
          authors:
            { $in: authorIds }
        }
      }).subscribe((value) => console.log("removed authors" + value))
  },
  'vocabulary.create'(_id: string, name: string, description: string, uriPrefix: string, field_public: boolean = false) {
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
      classes: []
    })

  },
  /*'vocabulary.insertClass'({id, vClass}) {
    Vocabularies.update({_id:id}, { $push: {classes: vClass}});
  },*/
  'vocabulary.remove'(vocabId: string) {
    assertUser();
    // TODO: Sanitize
    // currently: pseudo permission check via only being able to remove documents where the current user is also an author
    Vocabularies.remove({ _id: vocabId, creator: this.userId });
  },
  'class.create'(vocabId, name, description, URI, position) {
    assertUser();
    // TODO: Sanitize

    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const classIdO = Classes.insert({ name, description, URI, properties: [], position, skos: { closeMatch: [], exactMatch: [] } });
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
  'classes.translate'(classids: string[], dx: number, dy: number) {
    assertUser();
    // TODO: Sanitize
    Classes.update(
      { _id: { $in: classids } },
      { $inc: { 'position.x': dx, 'position.y': dy } },
      { multi: true }
    );
  },
  'classes.delete'(classId: string) {
    assertUser();
    const $getClassProps = Classes.find({ _id: classId }, {limit:1}).pipe(map((classes) => classes[0].properties))
    const $getClassRangeProps = Properties.find({ range: classId }).pipe(map((props) => props.map((prop) => prop._id)))

    combineLatest([$getClassProps,
      $getClassRangeProps]
    )
    .pipe(
      take(1),      
        tap(([x, y]) => console.log(x.concat(y))),
        map(([first, second]) => {
          first.concat(second)
          .forEach((propId)=>Properties.remove(propId))
          return true;
        })
      ).subscribe((_resp)=>Classes.remove(classId));

  },
  'property.create'(classId, name, description, URI, range) {
    assertUser();
    // TODO: Sanitize
    // Note, these operations must occur in this order. Otherwise an observer of the vocabualry might
    const propID = Properties.insert(
      { name, description, URI, range })
      ;
    propID.subscribe((pID) =>
      Classes.update(
        { _id: classId },
        {
          $push:
            { properties: pID }
        })
    );
  },
  'property.update'(id, name, description, URI, range) {
    assertUser();
    Properties.update(
      { _id: id },
      { $set: { name, description, URI, range } },
      {}
    )
  },
  'property.delete'(propId, sourceId) {
    assertUser();
    Classes.update(
      { _id: sourceId },
      { $pull: { properties: { $in: [propId] } } },
      {}
    )

    Properties.remove(
      { _id: propId }
    )
  }
});

JsonRoutes.add("get", "/vocabulary/:id", (req, res) => {
  try {
    const vocabId = req.params.id || null
    let name = ""

    const vocab = Vocabularies.findOne({ _id: vocabId }) || null
    if (!vocab) {
      throw new Meteor.Error(404, 'Not Found')
    }

    const authorEmails = vocab.authors.map((author) => {
      const emails = Users.findOne({ _id: author }).emails;
      if (!!emails)
        return emails
    })

    if (name === '' || name === undefined) name = 'vocab-' + vocabId;

    const buffer = saveClassesWithPropertiesAsFile(getClassesWithProperties(vocabId), vocab, authorEmails);

    res.setHeader('Content-type', 'text/plain');

    res.end(buffer)

  } catch (error) {
    console.log(error)
    res.end('Internal Server Error')
    return;
  }
});

export interface IClassWithProperties {
  _id: string; // Mongo generated ID
  name: string;
  description: string;
  URI: string;

  properties: Array<{
    _id: string; // Mongo generated ID
    name: string;
    description: string;
    URI: string;
    range: IClassWithProperties; // these MUST be in the same vocabulary!
  }>;
  position: {
    x: number;
    y: number;
  };
  skos: {
    closeMatch: string[];
    exactMatch: string[];
  };
}


function saveClassesWithPropertiesAsFile(classes: IClassWithProperties[], vocab: Ivocabulary, authorEmails: Array<Meteor.UserEmail[]>) {

  try {
    console.log('saveClassesWithPropertiesAsFile')
    const vocabDetail = vocab
    const namespace = `<${vocabDetail.uriPrefix}>`
    const creator: Iuser = (vocab.creator) ? Users.findOne({ _id: vocab.creator }, { fields: { emails: 1 } }) : null
    let rdf = ""

    // Adding meta for documenation generator
    rdf += `${namespace} a <http://www.w3.org/2002/07/owl#Ontology> .\r\n`;
    if (creator) {
      rdf += `${namespace} <http://purl.org/dc/terms/creator> "${creator.emails[0].address}" .\r\n`
      authorEmails = authorEmails.filter((emails) => emails[0].address != creator.emails[0].address)
    }

    authorEmails.forEach((emails) => emails.forEach((email) => {
      rdf += `${namespace} <http://purl.org/dc/terms/contributor> "${email.address}" .\r\n`
    })
    );

    rdf += `${namespace} <http://purl.org/dc/terms/title> "${vocabDetail.name}" .\r\n`;
    rdf += `${namespace} <http://purl.org/dc/terms/description> "${vocabDetail.description}" .\r\n`;


    const a = '<http://www.w3.org/2000/01/rdf-schema#type>';
    const domain = '<http://www.w3.org/2000/01/rdf-schema#domain>';
    const range = '<http://www.w3.org/2000/01/rdf-schema#range>';
    const rdfsclass = '<http://www.w3.org/2000/01/rdf-schema#Class>';
    const property = '<http://www.w3.org/2000/01/rdf-schema#Property>';
    const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
    const rdfsDescription = '<http://www.w3.org/2000/01/rdf-schema#description>'
    const xmlString = '<http://www.w3.org/2001/XMLSchema#string>'

    const allProps = Object.create(null);

    classes.forEach((clazz) => {
      const classURI = '<' + clazz.URI + '>';
      rdf += `${classURI} ${a} ${rdfsclass} .\r\n`;
      rdf += `${classURI} ${rdfsLabel} "${clazz.name}"^^${xmlString} .\r\n`;
      rdf += `${classURI} ${rdfsDescription} "${clazz.description}"^^${xmlString} .\r\n`;
      clazz.properties.forEach((prop) => {
        const propURI = '<' + prop.URI + '> ';
        allProps[propURI] = propURI;
        const rangeClassURI = '<' + prop.range.URI + '>';
        rdf += propURI + domain + classURI + ' .\r\n';
        rdf += propURI + range + rangeClassURI + ' .\r\n';
      });
    });

    // tslint:disable-next-line:forin
    for (const prop in allProps) {
      rdf += prop + a + property + ' .\n';
    }

    return rdf

  } catch (error) {
    console.log(error)
    throw error
  }

}




function getClassesWithProperties(vocabularyId: string): IClassWithProperties[] {

  let classes = getClasses(vocabularyId).map((c) => {
    const ps = Properties.find({ _id: { $in: c.properties } }).fetch()
    return { ...c, properties: ps };
  })

  const classeswithoutrangefilter = classes.map((cs) => {

    const filledProps = cs.properties.map((p) => {
      if (!p._id) throw new Meteor.Error(p + 'is missing an ID!');
      return { ...p, _id: p._id, range: null };
    });
    if (!cs._id) throw new Meteor.Error(cs + 'is missing an ID!');
    return { ...cs, _id: cs._id, properties: filledProps };
  });

  let failed = false;

  classeswithoutrangefilter.forEach((c, i) => {
    c.properties.forEach((p, j) => {
      p.range = classeswithoutrangefilter.find((cr) => cr._id === classes[i].properties[j].range);
      if (!p.range) {
        failed = true;
      }

    })
  })

  if (failed) {
    return null;
  }
  return classeswithoutrangefilter
}

function getClassIDsForVocabID(vocabularyId: string): meteorID[] {

  return Vocabularies.findOne({ _id: vocabularyId }, { fields: { classes: 1 } }).classes

}


function getClasses(vocabularyId: string): Iclass[] {
  if (vocabularyId === undefined || vocabularyId === '') {
    throw new Meteor.Error('vocabularyID not correctly specified. Got "' + vocabularyId + '"');
  }
  const classIDs: meteorID[] = getClassIDsForVocabID(vocabularyId);
  const res: Iclass[] = Classes.find({ _id: { $in: classIDs } }).fetch()

  return res;
}
