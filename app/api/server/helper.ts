import { Meteor } from 'meteor/meteor';
import { Iclass, Iuser, Ivocabulary, IClassWithProperties, PropertyType } from 'models';
import { meteorID } from '../models';
import { Classes, Properties, Vocabularies, Users } from '../collections';

import * as fs from 'fs';


// export function saveClassesWithPropertiesAsFile(classes: IClassWithProperties[], vocab: Ivocabulary, authorEmails: Meteor.UserEmail[][]) {

//     try {
//         console.log('saveClassesWithPropertiesAsFile');
//         const vocabDetail = vocab;
//         const namespace = `<${vocabDetail.uriPrefix}>`;
//         const creator: Iuser = (vocab.creator) ? Users.findOne({ _id: vocab.creator }, { fields: { emails: 1 } }) : null;
//         let rdf = '';


//         // Adding meta for documenation generator
//         rdf += `${namespace} a <http://www.w3.org/2002/07/owl#Ontology> .\r\n`;
//         if (creator) {
//             rdf += `${namespace} <http://purl.org/dc/terms/creator> "${creator.emails[0].address}" .\r\n`;
//             authorEmails = authorEmails.filter((emails) => emails[0].address != creator.emails[0].address);
//         }

//         authorEmails.forEach((emails) => emails.forEach((email) => {
//             rdf += `${namespace} <http://purl.org/dc/terms/contributor> "${email.address}" .\r\n`;
//         })
//         );

//         rdf += `${namespace} <http://purl.org/dc/terms/title> "${vocabDetail.name}" .\r\n`;
//         rdf += `${namespace} <http://purl.org/dc/terms/description> "${vocabDetail.description}" .\r\n`;


//         const a = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
//         const domain = '<http://www.w3.org/2000/01/rdf-schema#domain>';
//         const range = '<http://www.w3.org/2000/01/rdf-schema#range>';
//         const rdfsclass = '<http://www.w3.org/2000/01/rdf-schema#Class>';
//         const owlclass = '<http://www.w3.org/2002/07/owl#Class>';
//         const objectproperty = '<http://www.w3.org/2002/07/owl#ObjectProperty>';
//         const dataTypeProperty = '<http://www.w3.org/2002/07/owl#DatatypeProperty>';
//         const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
//         const rdfsDescription = '<http://www.w3.org/2000/01/rdf-schema#comment>';
//         const xmlString = '<http://www.w3.org/2001/XMLSchema#string>';

//         const objectProps = Object.create(null);
//         const dataProps = Object.create(null);
//         classes.forEach((clazz) => {
//             const classURI = '<' + clazz.URI + '>';
//             rdf += `${classURI} ${a} ${rdfsclass} .\r\n`;
//             rdf += `${classURI} ${a} ${owlclass} .\r\n`;
//             rdf += `${classURI} ${rdfsLabel} "${clazz.name}"^^${xmlString} .\r\n`;
//             rdf += `${classURI} ${rdfsDescription} "${clazz.description}"^^${xmlString} .\r\n`;
//             clazz.properties.forEach((prop) => {
//                 if (prop.type === PropertyType.Object) {
//                     const propURI = '<' + prop.URI + '> ';
//                     objectProps[propURI] = propURI;
//                     const rangeClassURI = '<' + prop.range.URI + '>';
//                     rdf += propURI + domain + ' ' + classURI + ' .\r\n';
//                     rdf += propURI + range + ' ' + rangeClassURI + ' .\r\n';
//                 } else {
//                     const propURI = '<' + prop.URI + '> ';
//                     dataProps[propURI] = propURI;
//                     const rangeClassURI = `<http://www.w3.org/2001/XMLSchema#${prop.range}>`;
//                     rdf += propURI + domain + ' ' + classURI + ' .\r\n';
//                     rdf += propURI + range + ' ' + rangeClassURI + ' .\r\n';
//                 }
//             });
//         });

//         // tslint:disable-next-line:forin
//         for (const prop in objectProps) {
//             rdf += prop + a + ' ' + objectproperty + ' .\n';
//         }

//         for (const prop in dataProps) {
//             rdf += prop + a + ' ' + dataTypeProperty + ' .\n';
//         }

//         return rdf;

//     } catch (error) {
//         console.log(error);
//         throw error;
//     }

// }




// export function getClassesWithProperties(vocabularyId: string): IClassWithProperties[] {

//     let propIds = [];
//     const classes = getClasses(vocabularyId).map((c) => {
//         const ps = Properties.find({ _id: { $in: c.properties } }).fetch();
//         propIds = propIds.concat(ps.map(ps => ps._id));
//         return { ...c, properties: ps };
//     });

//     const classeswithoutrangefilter = classes.map((cs) => {

//         const filledProps = cs.properties.map((p) => {
//             if (!p._id) throw new Meteor.Error(p + 'is missing an ID!');
//             return { ...p, _id: p._id, range: null };
//         });
//         if (!cs._id) throw new Meteor.Error(cs + 'is missing an ID!');
//         return { ...cs, _id: cs._id, properties: filledProps };
//     });

//     let failed = false;

//     classeswithoutrangefilter.forEach((c, i) => {
//         c.properties.forEach((p, j) => {
//             p.range = classeswithoutrangefilter.find((cr) => cr._id === classes[i].properties[j].range);
//             if (!p.range && p.type == PropertyType.Data) {
//                 p.range = classes[i].properties[j].range;
//             } else if (!p.range) {
//                 // return null; // not all required classes returned yet
//                 failed = true;
//             }

//         });
//     });

//     if (failed) {
//         return null;
//     }
//     return classeswithoutrangefilter;
// }

// function getClassIDsForVocabID(vocabularyId: string): meteorID[] {

//     return Vocabularies.findOne({ _id: vocabularyId }, { fields: { classes: 1 } }).classes;

// }


// function getClasses(vocabularyId: string): Iclass[] {
//     if (vocabularyId === undefined || vocabularyId === '') {
//         throw new Meteor.Error('vocabularyID not correctly specified. Got "' + vocabularyId + '"');
//     }
//     const classIDs: meteorID[] = getClassIDsForVocabID(vocabularyId);
//     const res: Iclass[] = Classes.find({ _id: { $in: classIDs }, isDataTypeVertex: false }).fetch();

//     return res;
// }


export function publishVocabulary(rdfTtl: String, vocabId) {
    try {
        const storageLocation = Meteor.settings.storageLocation;
        if (!storageLocation) {
            console.log('Config error');
            return;
        }
        let name = '';
        const vocab = Vocabularies.findOne({ _id: vocabId }) || null;
        if (!vocab) {
            throw new Meteor.Error(404, 'Not Found');
        }

        const authorEmails = vocab.authors.map((author) => {
            const emails = Users.findOne({ _id: author }).emails;
            if (!!emails)
                return emails;
        });

        if (name === '' || name === undefined) name = 'vocab-' + vocabId;

        const buffer = rdfTtl
        const filePath = `${storageLocation}/${vocab.name}.ttl`
        let fd = fs.openSync(filePath, 'w');
        const encoding = 'utf8'
        fs.write(fd, buffer, 0, encoding, function (err) {
            if (err) {
                throw (new Meteor.Error(500, 'Failed to save file.', err.message));
            } else {
                console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filePath);
            }
        });

    } catch (error) {
        console.log(error);
        return;
    }

}