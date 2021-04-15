

import { Iclass, Iuser, Ivocabulary, IClassWithProperties } from 'models'
import { meteorID } from '../models';
import { Classes, Properties, Vocabularies, Users } from '../collections';



export function saveClassesWithPropertiesAsFile(classes: IClassWithProperties[], vocab: Ivocabulary, authorEmails: Array<Meteor.UserEmail[]>) {

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


        const a = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
        const domain = '<http://www.w3.org/2000/01/rdf-schema#domain>';
        const range = '<http://www.w3.org/2000/01/rdf-schema#range>';
        const rdfsclass = '<http://www.w3.org/2000/01/rdf-schema#Class>';
        const owlclass = '<http://www.w3.org/2002/07/owl#Class>';
        const objectproperty = '<http://www.w3.org/2002/07/owl#ObjectProperty>';
        const rdfsLabel = '<http://www.w3.org/2000/01/rdf-schema#label>';
        const rdfsDescription = '<http://www.w3.org/2000/01/rdf-schema#description>'
        const xmlString = '<http://www.w3.org/2001/XMLSchema#string>'

        const allProps = Object.create(null);

        classes.forEach((clazz) => {
            const classURI = '<' + clazz.URI + '>';
            rdf += `${classURI} ${a} ${rdfsclass} .\r\n`;
            rdf += `${classURI} ${a} ${owlclass} .\r\n`;
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
            rdf += prop + a + objectproperty + ' .\n';
        }

        return rdf

    } catch (error) {
        console.log(error)
        throw error
    }

}




export function getClassesWithProperties(vocabularyId: string): IClassWithProperties[] {

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

// module.exports = {
//     saveClassesWithPropertiesAsFile: saveClassesWithPropertiesAsFile,
//     getClassesWithProperties: getClassesWithProperties
// }