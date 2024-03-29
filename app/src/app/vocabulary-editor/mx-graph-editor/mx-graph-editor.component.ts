import { Component, OnInit, ElementRef, ViewChild,  HostListener, OnDestroy,} from '@angular/core';
import { meteorID, Ivocabulary,IClassWithProperties } from '../../../../api/models';
import { MxgraphService } from '../../mxgraph/mxgraph';
import { VocabulariesService } from '../../services/vocabularies.service';
import { Observable, Subscription } from 'rxjs';
import { combineLatest, debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';
import { VocabularyEditorService } from '../vocabulary-editor.service';

// import sidebar state dep.


interface IMergedPropertiesClass {
    _id: string; // Mongo generated ID
    name: string;
    properties: {
        _id: string;
        name: string;
        rangeID: string; // just the ID
    }[];
}

@Component({
    selector: 'mx-graph-editor',
    templateUrl: './mx-graph-editor.component.html',
    styleUrls: ['./mx-graph-editor.component.scss']
})
export class MxGraphEditorComponent implements OnInit {

  currentSelection: meteorID;
  currentSelectionSub: Subscription;
  vocabularySub: Subscription;

  @ViewChild('view',{static: true}) mxGraphView: ElementRef;
   mx: MxgraphService;
   vocabID: string;
   classes: Observable<IClassWithProperties[]>;
   vocabulary: Ivocabulary;

   constructor(
     private vocabService: VocabulariesService,
     private vocabEditorService: VocabularyEditorService) { }


   ngOnInit() {
       this.vocabID = this.vocabEditorService.vocabularyId;

       // This did, however, not work.
       this.classes = this.vocabService.getClassesWithProperties(this.vocabID);

       this.vocabEditorService.setClasses(this.classes);
       this.mx = new MxgraphService(this.mxGraphView.nativeElement);

       this.currentSelectionSub = this.mx.currentSelection().pipe(
           combineLatest(this.mx.currentEdgeSelection(),
               (classSelection, edgeSelection) => {
                   console.log("current selection");
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
           if(selection != null )
               this.vocabEditorService.setEditorDrawer(true);
       });

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

       this.vocabularySub = this.vocabService.getVocabulary(this.vocabID).subscribe(
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
   }// end ngOnInit

   mergeProperties(c: IClassWithProperties): IMergedPropertiesClass {
       // only takes the necessary parts
       const withMergedProps: IMergedPropertiesClass = { _id: c._id, properties: [], name: c.name };
       // merge the properties and fill.
       const grouped = c.properties.reduce(
           (groups, x, ignored) => {
               (groups[x.range._id] = groups[x.range._id] || []).push(x);
               return groups;
           }, Object.create(null));

       // We used Object.create(null) to make grouped. So, it does not have any non-own properties.
       // in fact, it does not have hasOwnProperty
       // eslint-disable-next-line guard-for-in
       for (const key in grouped) {
           // if (grouped.hasOwnProperty(key)) {
           const group: {
              _id: string;
              name: string;

              range: IClassWithProperties;
          }[] = grouped[key];
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

   showEditBox() {
       console.log('show edit box');
       this.currentSelection = null;
   }

   ngOnDestroy() {
       this.mx.destroy();
       this.currentSelectionSub.unsubscribe();
       this.vocabularySub.unsubscribe();
   }

}
