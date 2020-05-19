import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable()
export class VocabularyEditorService {

    public allowEditing = false;
    private selected_vocabularyId: BehaviorSubject<string> = new BehaviorSubject(null);
    private _classes: BehaviorSubject<Observable<any>> = new BehaviorSubject(null);
    private classSub: Subscription;

    private _visibleCreateDrawer: BehaviorSubject<Boolean> = new BehaviorSubject(false);
    private _visibleEditDrawer: BehaviorSubject<Boolean> = new BehaviorSubject(false);
    private _visibleSearchDrawer: BehaviorSubject<Boolean> = new BehaviorSubject(false);

    constructor() {
    }

    get visibleCreatDrawer(): Observable<Boolean> {
        return this._visibleCreateDrawer
            .asObservable()
    }

    get visibleSearchDrawer(): Observable<Boolean> {
        return this._visibleSearchDrawer
            .asObservable()
    }

    get visibleEditorDrawer(): Observable<Boolean> {
        return this._visibleEditDrawer
            .asObservable();
    }

    get vocabularyId(): string {
        return this.selected_vocabularyId.getValue();
    }

    get classes(): any {
        return this._classes.getValue();
    }

    setClasses(classes: Observable<any>){
        this._classes.next(classes);
    }

    setVocabularyId(vocabularyId: string){
        this.selected_vocabularyId.next(vocabularyId);
    }

    setSearchDrawer(visible: boolean) {
        if(this.allowEditing)
            this._visibleSearchDrawer.next(visible);
    }

    setAddDrawer(visible: boolean) {
        console.log(this.allowEditing)
        if(this.allowEditing)
            this._visibleCreateDrawer.next(visible);
    }

    setEditorDrawer(visible: boolean) {
        console.log(this.allowEditing)
        if(this.allowEditing)
            this._visibleEditDrawer.next(visible);
    }

    clear() {
        this._classes.next(null);
        this.selected_vocabularyId.next(null);
        this.classSub.unsubscribe();
    }


}