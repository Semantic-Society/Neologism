import { Injectable } from '@angular/core';
import { mxgraph } from 'mxgraph';
import * as N3 from 'n3';
import 'rxjs/add/observable/bindCallback';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { error } from 'util';
import { prefixes as prefix_cc } from './prefix.cc';

export class N3Codec {
    // See https://github.com/RubenVerborgh/N3.js
    private absuluteURI = /^https?:\/\/|^\/\//i;
    private n3parser = N3.Parser();
    private tripleStream = new Subject<[Error, N3.Triple, N3.Prefixes]>();
    private prefixes: { [key: string]: string } = prefix_cc;

    static serializeModel(model: mxgraph.mxGraphModel) {
        const cells = model.getDescendants(model.getRoot());
        const writer = N3.Writer({ prefix_cc });
        cells.forEach((cell) => {
            const data = cell.getValue();
            if (data && cell.isVertex() && cell.getId()) {
                const subject = cell.getId();
                Object.keys(data).forEach((predicate) => {
                    for (const object of (data[predicate] as Set<string>)) {
                        writer.addTriple(subject, predicate, object);
                    }
                });
            } else if (cell.isEdge()) { // Currently only subClassOf
                const subject = this.neologismId(cell.source && cell.source.getId());
                const object = this.neologismId(cell.target && cell.target.getId());
                if (subject && object) {
                    writer.addTriple(subject, 'http://www.w3.org/2000/01/rdf-schema#subClassOf', object);
                }
            }
        });
        return new Promise((resolve, reject) => writer.end((err, result) => err ? reject(err) : resolve(result))) as Promise<string>;
    }

    static neologismId(id: string) {
        return id ? new URL(id, 'neo://query/').toString() : null;
    }

    constructor() {
        // this.mxGraphModel = this.mxGraph.getModel();
        // console.log('RdfModel Service instantiated.');

        // const sampleInput =
        //     '@prefix c: <http://example.org/cartoons#>.\n' +
        //     'c:Tom a c:Cat.\n' +
        //     'c:Jerry a c:Mouse;\n' +
        //     '        c:smarterThan c:Tom.';

        // this.tripleStream.subscribe(([e, triple, prefixes]) => {    // Todo: Unsubscribe on delete
        //     if (triple) {
        //         console.log(triple.subject, triple.predicate, triple.object, '.');
        //     } else {
        //         console.log('# That\'s all, folks!', prefixes);
        //     }
        // });

        // this.parseRdf(sampleInput);

        // this.tripleStream.subscribe(([e, triple, prefixes]) => {
        //     this.mxGraphModel
        // });
    }

    setPrefixes(prefixes: { [key: string]: string }) {
        this.prefixes = prefixes;
    }

    parseRdf(rdf: string) {
        this.n3parser.parse(
            rdf,
            (e: Error, triple: N3.Triple, prefs: N3.Prefixes) => this.tripleStream.next([e, triple, prefs]),
        );
        return this.tripleStream;
    }

    parseUrl(url: string) {
        this.getUrl(url)
            .then(this.parseRdf.bind(this))
            .catch((e) => console.log(e));
        return this.tripleStream;
    }

    private getUrl(url: string) { // TODO: Not exactly foolproof
        url = encodeURI(url);
        const conversionService = `http://rdf-translator.appspot.com/convert/detect/n3/${url}`;
        const toGet = this.absuluteURI.test(url) ? conversionService : url;
        return fetch(toGet).then((response) => response.text());
    }
}
