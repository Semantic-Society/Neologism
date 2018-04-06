import { Injectable } from '@angular/core';
import { mxgraph } from 'mxgraph';
import * as N3 from 'n3';
import 'rxjs/add/observable/bindCallback';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { error } from 'util';
// import { prefixes as prefix_cc } from './prefix.cc';

export class N3Codec {
    // See https://github.com/RubenVerborgh/N3.js
    private absuluteURI = /^https?:\/\/|^\/\//i;
    private n3parser = N3.Parser();
    private store: N3.N3StoreWriter = N3.Store();

    static neologismId(id: string) {
        return id ? new URL(id, 'neo://query/').toString() : null;
    }

    /**
     * Given a list of literals with mixed languyages. If the list is empty, return null. If there is a literal with language tag 'en', return that literal.
     * Otherwise, return the literal without language tag. If all these fail return any literal available.
     * Only the literal value of the literal is returned.
     * @param literals the literals from which you want to find the English variant
     */
    static getEnlishLiteral(literals: string[]) {
        if (literals.length === 0) return null;

        let resultWithoutLang: string;
        for (const literal of literals) {
            const lang = N3.Util.getLiteralLanguage(literal);
            if (lang === 'en') return N3.Util.getLiteralValue(literal);
            if (lang === '') resultWithoutLang = literal;
        }
        return N3.Util.getLiteralValue(resultWithoutLang) || N3.Util.getLiteralValue(literals[0]);
    }

    /**
     * Return the only element in an array. If there are 0 or more than 1 elements, throws an Error.
     * @param theList The list
     */
    static getOneandOnly<T>(theList: T[]): T {
        if (theList.length !== 1) {
            throw new Error('Trying to extract only element from a list which has ' + theList.length + '\t' + theList);
        }
        return theList[0];
    }

    constructor() { }

    serialize() {
        const writer = N3.Writer({ /*prefix_cc*/ });
        this.store.forEachByIRI((quad: N3.Triple) => writer.addTriple(quad));
        return new Promise((resolve, reject) => writer.end((err, result) => err ? reject(err) : resolve(result))) as Promise<string>;
    }

    load2store(rdf: string) {
        this.store = N3.Store();

        this.n3parser.parse(
            rdf,
            (e: Error, triple: N3.Triple, prefixes: N3.Prefixes) => {
                if (e) throw e;

                if (triple) {
                    this.store.addTriple(triple.subject, triple.predicate, triple.object);
                } else {
                    // Parsing complete
                    // this.prefixes = prefixes;
                }
            }
        );
    }

    loadUrl2store(url: string) {
        return this.getUrl(url)
            .then(this.load2store.bind(this));
    }

    addClass(classIRI: string) {
        this.store.addTriple(classIRI, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Class');
    }

    getClasses() {
        return this.store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Class')
            .map((triple) => {
                const subject = triple.subject;
                const labels = this.store.getObjectsByIRI(subject, 'http://www.w3.org/2000/01/rdf-schema#label'); // TODO Michael: Assuming string[] returned
                const oneLabel = N3Codec.getEnlishLiteral(labels);
                return {
                    uri: subject,
                    label: oneLabel || subject
                };
            });
    }

    /**
     * Add a label for an entity. The label should be the plain text of the label. The language will be fixed to 'en'
     * @param entityIRI the resource for which the label has to be added.
     * @param label The label
     */
    addEnglishLabel(entityIRI: string, label: string) {
        // if (!N3.Util.isLiteral(label))
        //    label = `"${label}"`;
        const literal = N3.Util.createLiteral(label, 'en');
        this.store.addTriple(entityIRI, 'http://www.w3.org/2000/01/rdf-schema#label', literal);
    }

    addEnglishComment(entityIRI: string, label: string) {
        const literal = N3.Util.createLiteral(label, 'en');
        this.store.addTriple(entityIRI, 'http://www.w3.org/2000/01/rdf-schema#comment', literal);
    }

    getPredicates() {
        return this.store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Property')
            .map((triple) => {
                const propertyURI = triple.subject;
                const labels = this.store.getObjectsByIRI(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#label');
                const oneLabel = N3Codec.getEnlishLiteral(labels);
                const comments = this.store.getObjectsByIRI(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#comment');
                const oneComment = N3Codec.getEnlishLiteral(comments);
                const domain = N3Codec.getOneandOnly(this.store.getObjectsByIRI(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#domain'));
                const range = N3Codec.getOneandOnly(this.store.getObjectsByIRI(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#range'));
                return {
                    uri: propertyURI,
                    label: oneLabel || propertyURI,
                    comment: oneComment || propertyURI,
                    domain,
                    range
                };
            });
    }

    addRDFSProperty(propertyURI: string, domain: string, range: string) {
        this.store.addTriple(propertyURI, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Property');
        this.store.addTriple(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#domain', domain);
        this.store.addTriple(propertyURI, 'http://www.w3.org/2000/01/rdf-schema#range', range);
    }

    addRDFSSubclassOf(subclass: string, superclass: string) {
        this.store.addTriple(subclass, 'http://www.w3.org/2000/01/rdf-schema#subClassOf', superclass);
    }

    getSubClassRelations(): Array<{ uri: string; label: string; domain: string; range: string; }> {
        const result = [];
        this.store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Class')
            .forEach((triple) => {
                const aClass = triple.subject;
                const subClasses = this.store.getObjectsByIRI(aClass, 'http://www.w3.org/2000/01/rdf-schema#subClassOf'); // TODO Michael: Assuming string[] returned
                subClasses.forEach((subClass) => {
                    result.push(
                        {
                            uri: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
                            label: 'rdfs:subClassOf',
                            domain: aClass,
                            range: subClass
                        }
                    );
                });
            });
        return result;
    }

    // addTriple(subject: string, predicate: string, object: string) {
    //     return this.store.addTriple(subject, predicate, object);
    // }

    private getUrl(url: string) { // TODO: Not exactly foolproof
        url = encodeURI(url);
        const conversionService = `http://rdf-translator.appspot.com/convert/detect/n3/${url}`;
        const toGet = this.absuluteURI.test(url) ? conversionService : url;
        return fetch(toGet).then((response) => response.text());
    }
}
