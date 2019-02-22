import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable()
export class VocabularyEditorService {

    private selected_vocabularyId: BehaviorSubject<string> = new BehaviorSubject(null);
    private _classes: BehaviorSubject<Observable<any>> = new BehaviorSubject(null);
    private classSub: Subscription;

    constructor() {
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

    clear() {
        this._classes.next(null);
        this.selected_vocabularyId.next(null);
        this.classSub.unsubscribe();
    }


}