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
    private store: N3.N3StoreWriter;

    static neologismId(id: string) {
        return id ? new URL(id, 'neo://query/').toString() : null;
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

    getClasses() {
        return this.store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Class')
            .map((triple) => {
                const subject = triple.subject;
                const labels = this.store.getObjectsByIRI(subject, 'http://www.w3.org/2000/01/rdf-schema#Label'); // TODO Michael: Assuming string[] returned
                // TODO: Michael Pluck english label
                return {
                    subject,
                    label: labels[0] || subject
                };
            });
    }

    getPredicates() {
        // TODO Michael 
    }

    getSubClassRelations(){
        // TODO Michael
    }

    private getUrl(url: string) { // TODO: Not exactly foolproof
        url = encodeURI(url);
        const conversionService = `http://rdf-translator.appspot.com/convert/detect/n3/${url}`;
        const toGet = this.absuluteURI.test(url) ? conversionService : url;
        return fetch(toGet).then((response) => response.text());
    }
}
