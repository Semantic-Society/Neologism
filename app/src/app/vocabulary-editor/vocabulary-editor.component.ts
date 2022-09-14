import { Component, OnInit, Input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import sidebar state dep.
import { VocabularyEditorService } from './vocabulary-editor.service';
import { VocabulariesService,  } from '../services/vocabularies.service';
import { RecommendationService } from '../services/recommendation.service';
import { map, switchMap, tap, startWith } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { IClassProperty } from '../models/editbox.model';
import { EditComponentService } from './edit.component.service';
import { PropertyType ,IClassWithProperties} from "./../../../api/models";

class VocabClass {
  name: string;
  URI: string;
  description: string;
  property: ClassPropertyI;

  constructor() {
      this.name = '';
      this.URI  = '';
      this.description = '',
      this.property = {
          name: '',
          URI: '',
          description: '',
          range: ''
      };
  }
};

interface ClassPropertyI {
  name: string;
  URI: string;
  description: string;
  range: string;
}


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
    selector: 'app-vocabulary-editor',
    templateUrl: './vocabulary-editor.component.html',
    styleUrls: ['./vocabulary-editor.component.scss']
})

export class VocabularyEditorComponent implements OnInit {

  vocabID: string;
  selectedViewMethod: 'mxgraph' | 'list-view';

  public visibleAddClass =  this.vocabEditorService.visibleCreatDrawer;
  public visibleSearch = this.vocabEditorService.visibleSearchDrawer;
  public visibleEditor = this.vocabEditorService.visibleEditorDrawer;

  public newClassC = new VocabClass();



  // EDIT BOX DATA
  //  alreadyThere: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
     alreadyThere2: Observable<{ comment: string; label: string; uri: string; range: string }[]>;

     //  propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
     propertyRecommendations: Observable<{ comment: string; label: string; uri: string; range: string }[]>;

    // TODO (186): as this is an observable, does it need @Input?
    @Input() selectedClassID: string;

    /**
     * If more classinfo is needed, it can be fetched in ngOnInit below.
     */
     classInfo: Observable<{ label: string; description: string; url: string }>;

     // TODO (184): strictly speaking, this component does not need this as it only needs access to classes and properties.
     // However, more fine grained methods in the VocabulariesService are not yet implemented.
     newClass = {
         name: '',
         URI: '',
         description: '',
         property: {
             name: '',
             URI: '',
             description: '',
             range: ''
         }
     };

     editedClass: {
      name: string;
      URI: string;
      description: string;
    };

     emptyClass = {
         name: '',
         URI: '',
         description: '',
         property: {
             name: '',
             URI: '',
             description: '',
             range: ''
         }
     };

     classToUpdate: Observable<IClassWithProperties>;
     editToggle = false;

     rangeOptions: Observable<{ _id: string; name: string }[]>;

     // EDIT BOX DATA END


     constructor(
     private route: ActivatedRoute,
     private router: Router,
     private vocabService: VocabulariesService,
     private recommender: RecommendationService,
     private editComponentService: EditComponentService,
     public vocabEditorService: VocabularyEditorService) { }


     changeViewMethod(selection: string) {
         if(selection === 'mxgraph')
             this.router.navigateByUrl('edit/' + this.vocabID + '/mxgraph');

         if(selection === 'list-view')
             this.router.navigateByUrl('edit/' + this.vocabID + '/list');
     }

     ngOnInit() {

         this.vocabID = this.route.snapshot.paramMap.get('id');
         this.vocabEditorService.setVocabularyId(this.vocabID);
         this.selectedViewMethod = 'mxgraph';

         // EDITBOX INIT
         this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
             map((classes) => classes.map((aclass) => ({_id: aclass._id, name: aclass.name})))
         );

         this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedClassID));

     }

     openCreateClassModal(){
         this.vocabEditorService.setAddDrawer(true);
     }

     openSearchExistingClassModal() {
         this.vocabEditorService.setSearchDrawer(true);
     }

     addClass(){
         this.vocabService.addClass(this.vocabID, this.newClassC.name, this.newClassC.description, this.newClassC.URI).subscribe(res=>"");
         this.newClass = new VocabClass();
         this.close();
     }

     close(){
         this.vocabEditorService.setSearchDrawer(false);
         this.vocabEditorService.setAddDrawer(false);
     }

     // EDIT BOX SETTINGS SHOULD BE MOVED TO ITS OWN COMPONENT
     // THAT IS CALLED IN EDIT DRAWER (in the vocab-edit.html)



     ngOnChanges(input) {

         this.editedClass = this.editComponentService.getUndefinedClass();

         const classID: string = input.selectedClassID.currentValue;

         if (!classID) {
             return;
         }

         // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
         this.classInfo = this.editComponentService.createClassInfoObj(this.vocabID, classID);

         this.alreadyThere2 = this.editComponentService.getClassProperties(this.vocabID, classID);

         // actually already refacored (in editbox service) but very hard to test as the
         // recommender service always returns an empty array, bug ?
         this.propertyRecommendations = this.editComponentService.getClass$(this.vocabID, classID)
             .pipe(
                 switchMap((theclass) => this.recommender.propertyRecommendation(theclass.URI).pipe(
                     tap(as=> console.log(as, "recommendations")),
                     // combineLatest(this.alreadyThere2, (recommendations, alreadys) => {
                     //   const newReccommendations = [];
                     //   recommendations.forEach((recommendation) => {
                     //     //       // TODO (184)is there a better way in JS?
                     //     if (!alreadys.some((already) => {
                     //       return already.uri === recommendation.uri;
                     //     })) {
                     //       // the property is not there yet
                     //       newReccommendations.push(recommendation);
                     //     }
                     //   });
                     //   return newReccommendations;
                     // })
                 )),
                 startWith([]),
             );


     }

     addRecommendedProperyToGraph(rec: IClassProperty){
         this.editComponentService.addRecommendedProperyToGraph(rec, this.selectedClassID, this.vocabID);
     }

     addEditClass() {
         console.log(this.newClass);
         this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI).subscribe(res=>"");
         this.newClass = this.emptyClass;
     }

     addProperty() {
         if (this.selectedClassID !== this.newClass.property.range) {
             this.vocabService.addProperty(this.selectedClassID, this.newClass.property.name, this.newClass.property.description, this.newClass.property.URI, this.newClass.property.range,PropertyType.Object,null);
             this.newClass = this.emptyClass;
         }
     }

     toggleEdit() {
         this.editToggle = !this.editToggle;
     }

     cancelEdit() {
         this.editToggle = false;
         this.editedClass = {
             name: undefined,
             URI: undefined,
             description: undefined,
         };
     }

     updateEdit() {
         console.log(this.editedClass);
         if (this.editedClass.name) {
             this.vocabService.updateClassName(this.selectedClassID, this.editedClass.name);
         }
         if (this.editedClass.description) {
             this.vocabService.updateClassDescription(this.selectedClassID, this.editedClass.description);
         }
         if (this.editedClass.URI) {
             this.vocabService.updateClassURI(this.selectedClassID, this.editedClass.URI);
         }
         this.cancelEdit();
     }


}
