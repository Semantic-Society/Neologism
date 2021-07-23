import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { DataFactory, Writer, Quad, Parser, Store, termToId } from 'n3';
const { namedNode, literal, quad } = DataFactory
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
        xmlns: 'http://www.w3.org/2001/XMLSchema#',
        purl: 'http://purl.org/dc/terms/'
    }

    public static serialize(id, classesWithProps, callBack) {

        try {
            const vocabId = id || null
            let name = ""

            const writer = new Writer({
                prefixes: N3Codec.neoPrefixes
            });

            let vocab = Vocabularies.findOne({ _id: vocabId }) || null
            if (!vocab) {
                throw new Meteor.Error(404, 'Not Found')
            }

            let authorEmails = vocab.authors.map((author) => {
                const emails = Users.findOne({ _id: author }).emails;
                if (!!emails)
                    return emails
            })

            if (name === '' || name === undefined) name = 'vocab-' + vocabId;


            let classes: IClassWithProperties[] = classesWithProps
            classes = classes.filter((classs) => !classs.isDataTypeVertex)
            const creator: Iuser = (vocab.creator) ? Users.findOne({ _id: vocab.creator }, { fields: { emails: 1 } }) : null
            let quads: Quad[] = []
            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://www.w3.org/2002/07/owl#Ontology')
            ))
            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/creator'),
                literal(creator.emails[0].address)
            ))

            authorEmails = authorEmails.filter((emails) => emails[0].address != creator.emails[0].address)
            authorEmails.forEach((emails) => emails.forEach((email) => {
                quads.push(quad(
                    namedNode(vocab.uriPrefix),
                    namedNode('http://purl.org/dc/terms/contributor'),
                    literal(email.address)
                ))
            }))


            quads.push(quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/title'),
                literal(vocab.name)
            ), quad(
                namedNode(vocab.uriPrefix),
                namedNode('http://purl.org/dc/terms/description'),
                literal(vocab.description)
            ))


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
                    ), quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
                        literal(clazz.name)
                    ),
                    quad(
                        namedNode(clazz.URI),
                        namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
                        literal(clazz.description)
                    ))

                clazz.properties.forEach((prop) => {
                    quads.push(quad(
                        namedNode(prop.URI),
                        namedNode('http://www.w3.org/2000/01/rdf-schema#domain'),
                        namedNode(clazz.URI)
                    ))
                    if (prop.type === PropertyType.Object) {
                        objectProps[prop.URI] = prop.URI;
                        quads.push(quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#range'),
                            namedNode(prop.range.URI)
                        ))
                    }
                    else {
                        dataProps[prop.URI] = prop.URI;
                        quads.push(quad(
                            namedNode(prop.URI),
                            namedNode('http://www.w3.org/2000/01/rdf-schema#range'),
                            namedNode(`http://www.w3.org/2001/XMLSchema#${prop.range as unknown as string}`)
                        ))
                    }



                });
            });
            for (const propURI in objectProps) {
                quads.push(quad(
                    namedNode(propURI),
                    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                    namedNode('http://www.w3.org/2002/07/owl#ObjectProperty')
                ))
            }

            for (const propURI in dataProps) {
                quads.push(quad(
                    namedNode(propURI),
                    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                    namedNode('http://www.w3.org/2002/07/owl#DatatypeProperty')
                ))
            }
            writer.addQuads(quads)
            writer.end((error, result) => {
                if (error) {
                    console.error("error")
                    return;
                }
                callBack(result)
                return;
            })
        } catch (error) {
            console.log(error)
            return;
        }
    }

    deserialize(quads: String | any, callBack): void {
        const list: Quad[] = []
        this.parser.parse(
            quads,
            (error, quad: Quad, prefixes) => {
                if (quad)
                    list.push(quad)
                else {
                    callBack(new Store(list))
                    console.log("# That's all, folks!", prefixes);
                }

            });
    }

    getMeta(store: Store) : {name:string, uri:string,desc:string}{

        const quad = store.getQuads(null, namedNode('http://purl.org/dc/terms/title'), null, null)[0]
        return {
            name: store.getQuads(null, namedNode('http://purl.org/dc/terms/title'), null, null)[0].object.value,
            uri: store.getQuads(null, null, namedNode('http://www.w3.org/2002/07/owl#Ontology'), null)[0].subject.value,
            desc: store.getQuads(null, namedNode('http://purl.org/dc/terms/description'), null, null)[0].object.value,
        }

    }

    getClasses(store: Store) {
        return store.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2000/01/rdf-schema#Class'), null)
            .map((triple) => {
                const subject = triple.subject;
                const labels = store.getQuads(subject, namedNode('http://www.w3.org/2000/01/rdf-schema#label'), null, null); // TODO Michael: Assuming string[] returned
                const oneLabel = labels[0].object.value
                const description = store.getQuads(subject, namedNode('http://www.w3.org/2000/01/rdf-schema#comment'), null, null)[0].object.value
                return {
                    uri: subject.value,
                    label: oneLabel || subject,
                    description: description
                };
            });
    }

    getSubClassRelations(store: Store): Array<{ uri: string; label: string; domain: string; range: string; }> {
        const result = [];
        store.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2000/01/rdf-schema#Class'), null)
            .forEach((triple) => {
                const aClass = triple.subject;
                const subClasses = store.getQuads(null, 'http://www.w3.org/2000/01/rdf-schema#domain', aClass, null); // TODO Michael: Assuming string[] returned
                subClasses.forEach((subClass) => {
                    const range = store.getQuads(subClass.subject, 'http://www.w3.org/2000/01/rdf-schema#range', null, null);
                    const isDataType = store.getQuads(subClass.subject, null, "http://www.w3.org/2002/07/owl#DatatypeProperty", null).length ? true : false;
                    result.push(
                        {
                            uri: 'http://www.w3.org/2000/01/rdf-schema#domain',
                            label: 'rdfs:subclass',
                            domain: aClass,
                            dataType: isDataType,
                            range: range[0].object
                        }
                    );
                });
            });
        return result;
    }

    static neologismId(id: string) {
        return id ? new URL(id, 'neo://query/').toString() : null;
    }
}
