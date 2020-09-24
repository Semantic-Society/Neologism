
import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { Observable, Subscription } from 'rxjs';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

import { MxgraphService } from './mxgraph';

import { Ivocabulary, meteorID,IvocabularyExtended } from '../../../api/models';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';

// import sidebar state dep.
import { SideBarStateService, SidebarChange } from '../services/state-services/sidebar-state.service';


interface IMergedPropertiesClass {
    _id: string; // Mongo generated ID
    name: string;
    properties: Array<{
        _id: string;
        name: string;
        rangeID: string; // just the ID
    }>;
}

@Component({
    selector: 'app-mxgraph',
    templateUrl: './mxgraph.component.html',
    styleUrls: ['./mxgraph.component.css'],
})

export class MxgraphComponent implements OnInit, OnDestroy {

    editMode: Observable<SidebarChange>; // type SidebarChange = 'default' | 'edit' | 'recommend'
    currentSelection: meteorID;
    currentSelectionSub: Subscription;
    vocabularySub: Subscription;

    @ViewChild('view') mxGraphView: ElementRef;
     mx: MxgraphService;
     vocabID: string;
     classes: Observable<IClassWithProperties[]>;
     vocabulary: IvocabularyExtended;

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event) {
      if (event.keyCode === 27) { // 27 is keycode for ESC
        this.sideBarState.changeBySelection('default');
      }
    }


    constructor(
         private route: ActivatedRoute, 
         private vocabService: VocabulariesService,
         private sideBarState: SideBarStateService) {
            this.editMode = this.sideBarState.editMode;
    }


    ngOnInit() {
        this.vocabID = this.route.snapshot.paramMap.get('id');
        // TODO: Currently creates a new instance with each subscription. Use something like this instead: .multicast(new BehaviorSubject([]));
        // This did, however, not work.
        this.classes = this.vocabService.getClassesWithProperties(this.vocabID);
        this.mx = new MxgraphService(this.mxGraphView.nativeElement);

        // console.log('the is of the vocb is ' + this.id);

        // this.vocabService.addClass(this.vocabID, 'ClassName', 'Iraklis did it', 'the URI');
        // this.vocabService.addProperty('ikhjrcSqXJQQrgfC6', 'myprop', 'nice prop', 'example.org', 'c8YSBREPsKex4526d');

        // this.currentSelection = this.mx.currentSelection().publish(new BehaviorSubject<string>(null));
        this.currentSelectionSub = this.mx.currentSelection().pipe(
            combineLatest(this.mx.currentEdgeSelection(),
                (classSelection, edgeSelection) => {
                    if (classSelection !== null) {
                        return classSelection;
                    } else if (edgeSelection !== null) {
                        return edgeSelection.domainClazzID;
                    } else {
                        return null;
                    }
                }
            ),
            debounceTime(20),
            distinctUntilChanged()
        ).subscribe((selection) => {

            this.sideBarState.changeBySelection(selection);
            this.currentSelection = selection;
        });

        // TODO It looks like this currently leaks observables.
        this.mx.deleteRequestObservable().pipe(
            combineLatest(this.mx.currentEdgeSelection(), this.mx.currentSelection(),
                (keyevent, edgeSel, nodeSel) => ({ key: keyevent, edge: edgeSel, node: nodeSel })
            ),
            filter((possibleDelReq) => possibleDelReq.key !== null && (possibleDelReq.edge !== null || possibleDelReq.node !== null))
        ).subscribe(
            (deleteRequest) => {
                console.log('delete key presses seem to be not deatlh correctly atm. Pressing the del key multiple times and then clicking nodes, fires delete events still.');
                if (deleteRequest.edge !== null) {
                    // this.vocabService.deleteProperty();
                    console.log('delete edge ', deleteRequest.edge);
                }
                if (deleteRequest.node !== null) {
                    console.log('delete node', deleteRequest.node);
                }
            }
        );

        this.vocabularySub = this.vocabService.getVocabulary(this.vocabID).pipe(map((vocab,index)=>{
            let emailAddress=""
            vocab.authors.forEach(author=>emailAddress+=this.vocabService.getEmailAddress(author)+" ")
            let newVocab= <IvocabularyExtended>{}; 
            newVocab._id=vocab._id;
            newVocab.authorsEmailAddress=emailAddress;
            newVocab.authors=vocab.authors;
            newVocab.classes=vocab.classes;
            newVocab.description=vocab.description;
            newVocab.name=vocab.name;
            newVocab.public=vocab.public;
            newVocab.uriPrefix=vocab.uriPrefix;
            return newVocab;
        })).subscribe(
            (v) => this.vocabulary = v,
            (e) => console.log(e),
            () => this.vocabulary = null
        );

        // this.mx.addSelectionListener((id: meteorID) => {
        //     if (id) {
        //         this.currentSelection = id;
        //         this.editMode = SideBarState.Edit;
        //     } else {
        //         this.currentSelection = null;
        //         this.editMode = SideBarState.Default;
        //     }
        // });

        this.mx.addDragListener((ids, dx, dy) => {
            // console.log(ids, dx, dy);
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.pipe(
            debounceTime(80),
        ).subscribe((cs) => {
            this.mx.startTransaction();

            this.mx.clearModel();

            // insert classes
            cs.forEach((c) =>
                this.mx.insertClass(c._id, c.name, c.position.x, c.position.y)
            );

            // insert properties
            cs.forEach((c) => {
                // grouping the properties by their target
                const merged = this.mergeProperties(c);
                merged.properties.forEach((p) =>
                    this.mx.insertProperty(c._id,
                        p._id, p.name,
                        p.rangeID)
                );
            });

            this.mx.endTransaction();
        });

        // this.mx = new MxgraphService(
        //     this.mxGraphView.nativeElement,
        //     document.getElementById('mx-toolbar'),
        //     'http://xmlns.com/foaf/spec/index.rdf');
    }// end ngOnInit

    mergeProperties(c: IClassWithProperties): IMergedPropertiesClass {
        // only takes the necessary parts
        const withMergedProps: IMergedPropertiesClass = { _id: c._id, properties: [], name: c.name };
        // merge the properties and fill.
        // TODO: is this better solved with a ES6 Map?
        const grouped = c.properties.reduce(
            (groups, x, ignored) => {
                (groups[x.range._id] = groups[x.range._id] || []).push(x);
                return groups;
            }, Object.create(null));

        // We used Object.create(null) to make grouped. So, it does not have any non-own properties.
        // in fact, it does not have hasOwnProperty
        // tslint:disable-next-line:forin
        for (const key in grouped) {
            // if (grouped.hasOwnProperty(key)) {
            const group: Array<{
                _id: string;
                name: string;

                range: IClassWithProperties;
            }> = grouped[key];
            // join names
            const nameList: string[] = group.reduce<string[]>(
                (combinedNameAcc, prop, ignores) => {
                    combinedNameAcc.push(prop.name);
                    return combinedNameAcc;
                }, []);
            const combinedName = nameList.join(' | ');
            withMergedProps.properties.push({ _id: key, name: combinedName, rangeID: group[0].range._id });
            // }
        }
        return withMergedProps;
    }

    showRecommender() {
        this.sideBarState.changeSidebarState('recommend');
    }

    showNodeCreator() {
        this.sideBarState.changeSidebarState('create');
    }

    showEditBox() {
        console.log('show edit box')
        this.currentSelection = null;
        this.sideBarState.changeSidebarState('edit');
    }

    ngOnDestroy() {
        console.log("DEstroy is called")
        this.mx.destroy();
        this.currentSelectionSub.unsubscribe();
        this.vocabularySub.unsubscribe();
    }
}
