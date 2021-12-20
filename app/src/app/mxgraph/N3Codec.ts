import { Injectable } from '@angular/core';
import { DataFactory, Writer, Quad, Parser, Store, termToId } from 'n3';
const { namedNode, literal, quad } = DataFactory;
import { Vocabularies, Users } from '../../../api/collections';
import { IClassWithProperties, Iuser, PropertyType, } from '../../../api/models'

@Injectable({
    providedIn: 'root',
})
export class N3Codec {
    parser = new Parser();

    public static neoPrefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        owl: 'http://www.w3.org/2002/07/owl#',
        purl: 'http://purl.org/dc/terms/',
        proxivocab: 'http://hussain.ali.gitlab.io/vocab-proximity/',
        // base: 'http://w3id.org/neologism/'
    };

    public static serialize(id, classesWithProps, respHandler) {

        try {
            const vocabId = id || null;
            let name = ""

            const writer = new Writer({
                prefixes: N3Codec.neoPrefixes,
            });

            const vocab = Vocabularies.findOne({ _id: vocabId }) || null;
            if (!vocab) {
                throw new Meteor.Error(404, 'Not Found');
            }

            let authorEmails = vocab.authors.map((author) => {
                const emails = Users.findOne({ _id: author }).emails;
                if (!!emails)
                    return emails;
            });

            if (name === '' || name === undefined) name = 'vocab-' + vocabId;


            let classes: IClassWithProperties[] = classesWithProps;
            const dataTypeProps = classes.filter((classs) => classs.isDataTypeVertex);
            classes = classes.filter((classs) => !classs.isDataTypeVertex);
            const creator: Iuser = (vocab.creator) ? Users.findOne({ _id: vocab.creator }, { fields: { emails: 1 } }) : null;
            const quads: Quad[] = [];
            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://www.w3.org/2002/07/owl#Ontology')
            ));
            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/creator'),
                literal(creator.emails[0].address)
            ));

            authorEmails = authorEmails.filter((emails) => emails[0].address != creator.emails[0].address);
            authorEmails.forEach((emails) => emails.forEach((email) => {
                quads.push(quad(
                    namedNode(vocab.uriPrefix),
                    namedNode('http://purl.org/dc/terms/contributor'),
                    literal(email.address)
                ));
            }));


            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/title'),
                literal(vocab.name)
            ), quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/description'),
                literal(vocab.description)
            ));


            const objectProps = Object.create(null);
            const dataProps = Object.create(null);

            classes.forEach((clazz) => {

                quads.push(quad(
                    namedNode(clazz.URI),
                    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                    namedNode('http://www.w3.org/2000/01/rdf-schema#Class')
                ),
                    quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                        namedNode('http://www.w3.org/2002/07/owl#Class')
                    ),
                    quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                        namedNode('http://hussain.ali.gitlab.io/vocab-proximity/hasCoordinates')
                    ), quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
                        literal(clazz.name)
                    ),
                    quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
                        literal(clazz.description)
                    ),
                    quad(
                        namedNode(clazz.URI),
                        namedNode('http://hussain.ali.gitlab.io/vocab-proximity/hasX'),
                        literal(clazz.position.x)
                    ), quad(
                        namedNode(clazz.URI),
                        namedNode('http://hussain.ali.gitlab.io/vocab-proximity/hasY'),
                        literal(clazz.position.y)
                    ));



                clazz.properties.forEach((prop) => {

                    if (prop.type === PropertyType.Object) {
                        objectProps[prop.URI] = prop.URI;
                        quads.push(quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                            namedNode('http://www.w3.org/2002/07/owl#ObjectProperty')
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#domain'),
                            namedNode(clazz.URI)
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#range'),
                            namedNode(prop.range.URI)
                        ));
                    } else {
                        dataProps[prop.URI] = prop.URI;
                        let temp = dataTypeProps.filter(prop1 => prop1._id == prop._id)
                        quads.push(quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                            namedNode('http://www.w3.org/2002/07/owl#DatatypeProperty')
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#domain'),
                            namedNode(clazz.URI)
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#range'),
                            namedNode(`http://www.w3.org/2001/XMLSchema#${prop.range as unknown as string}`)
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://hussain.ali.gitlab.io/vocab-proximity/hasX'),
                            literal(temp[0].position.x)
                        ), quad(
                            namedNode(prop.URI),
                            namedNode('http://hussain.ali.gitlab.io/vocab-proximity/hasY'),
                            literal(temp[0].position.y)
                        ));
                    }

                });
            });

            writer.addQuads(quads);
            writer.end((error, result) => {
                if (error) {
                    console.error(error);
                    return;
                }
                respHandler(result);
                return;
            });
        } catch (error) {
            console.log(error);
            return;
        }
    }

    deserialize(quads: String | any, respHandler): void {
        const list: Quad[] = [];
        this.parser.parse(
            quads,
            (error, quad: Quad, prefixes) => {
                if (quad)
                    list.push(quad);
                else {
                    respHandler(new Store(list));
                }

            });
    }

    getMeta(store: Store): { name: string; uri: string; desc: string } {

        return {
            name: store.getQuads(null, namedNode('http://purl.org/dc/terms/title'), null, null)[0].object.value,
            uri: store.getQuads(null, null, namedNode('http://www.w3.org/2002/07/owl#Ontology'), null)[0].subject.value,
            desc: store.getQuads(null, namedNode('http://purl.org/dc/terms/description'), null, null)[0].object.value,
        };

    }

    getClasses(store: Store) {
        return store.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2000/01/rdf-schema#Class'), null)
            .map((triple) => {
                const subject = triple.subject;
                const labels = store.getQuads(subject, namedNode('http://www.w3.org/2000/01/rdf-schema#label'), null, null);
                const oneLabel = labels[0].object.value;
                const description = store.getQuads(subject, namedNode('http://www.w3.org/2000/01/rdf-schema#comment'), null, null)[0].object.value;
                return {
                    uri: subject.value,
                    label: oneLabel || subject,
                    description
                };
            });
    }

    getSubClassRelations(store: Store): { uri: string; label: string; domain: string; range: string }[] {
        const result = [];
        store.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2000/01/rdf-schema#Class'), null)
            .forEach((triple) => {
                const aClass = triple.subject;
                const subClasses = store.getQuads(null, 'http://www.w3.org/2000/01/rdf-schema#domain', aClass, null);
                subClasses.forEach((subClass) => {
                    const range = store.getQuads(subClass.subject, 'http://www.w3.org/2000/01/rdf-schema#range', null, null);
                    const isDataType = store.getQuads(subClass.subject, null, "http://www.w3.org/2002/07/owl#DatatypeProperty", null).length ? true : false;
                    const rangeLabel = range[0].object.value.split('#')[1];
                    const propLabel = subClass.subject.value.split('#')[1];
                    const domainLabel = aClass.value.split('#')[1];
                    result.push(
                        {
                            uri: subClass.subject.value,
                            label: propLabel,
                            domain: domainLabel,
                            description: "", // TODO: Fix export to include comments
                            type: isDataType ? PropertyType.Data : PropertyType.Object,
                            range: rangeLabel
                        }
                    );
                });
            });
        return result;
    }

}
