import { Injectable } from '@angular/core';
import 'rxjs/add/observable/bindCallback';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';

import * as N3 from 'n3';
import { Subject } from 'rxjs/Subject';
import { error } from 'util';

export class N3Codec {
    // See https://github.com/RubenVerborgh/N3.js
    private n3parser = N3.Parser();
    private tripleStream = new Subject<[Error, N3.Triple, N3.Prefixes]>();

    constructor() {
        // this.mxGraphModel = this.mxGraph.getModel();
        console.log('RdfModel Service instantiated.');

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

    parseRdf(rdf: string) {
        this.n3parser.parse(
            rdf,
            (e: Error, triple: N3.Triple, prefixes: N3.Prefixes) => this.tripleStream.next([e, triple, prefixes]),
        );
        return this.tripleStream;
    }

    parseUrl(url: string) {
        this.getUrl(url)
            .then(this.parseRdf.bind(this))
            .catch((e) => console.log(e));
        return this.tripleStream;
    }

    private getUrl(url: string) {
        url = encodeURI(url);
        const conversionService = `http://rdf-translator.appspot.com/convert/detect/n3/${url}`;
        return fetch(conversionService).then((response) => response.text());
    }
}
