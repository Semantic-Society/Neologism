import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable()
export class VocabularyEditorService {

    public allowEditing = false;
     selected_vocabularyId: BehaviorSubject<string> = new BehaviorSubject(null);
     _classes: BehaviorSubject<Observable<any>> = new BehaviorSubject(null);
     classSub: Subscription;

     _visibleCreateDrawer: BehaviorSubject<boolean> = new BehaviorSubject(false);
     _visibleEditDrawer: BehaviorSubject<boolean> = new BehaviorSubject(false);
     _visibleSearchDrawer: BehaviorSubject<boolean> = new BehaviorSubject(false);

     constructor() {
     }

     get visibleCreatDrawer(): Observable<boolean> {
         return this._visibleCreateDrawer
             .asObservable();
     }

     get visibleSearchDrawer(): Observable<boolean> {
         return this._visibleSearchDrawer
             .asObservable();
     }

     get visibleEditorDrawer(): Observable<boolean> {
         return this._visibleEditDrawer
             .asObservable();
     }

     get vocabularyId(): string {
         return this.selected_vocabularyId.getValue();
     }

     get classes(): any {
         return this._classes.getValue();
     }

     setClasses(classes: Observable<any>) {
         this._classes.next(classes);
     }

     setVocabularyId(vocabularyId: string) {
         this.selected_vocabularyId.next(vocabularyId);
     }

     setSearchDrawer(visible: boolean) {
         if (this.allowEditing)
             this._visibleSearchDrawer.next(visible);
     }

     setAddDrawer(visible: boolean) {
         console.log(this.allowEditing);
         if (this.allowEditing)
             this._visibleCreateDrawer.next(visible);
     }

     setEditorDrawer(visible: boolean) {
         console.log(this.allowEditing);
         if (this.allowEditing)
             this._visibleEditDrawer.next(visible);
     }

     clear() {
         this._classes.next(null);
         this.selected_vocabularyId.next(null);
         this.classSub.unsubscribe();
     }

}
