import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SidebarChange = 'default' | 'edit' | 'recommend'

@Injectable()
export class SideBarStateService {

    // it is necessarry to cast the string
    private _editMode: BehaviorSubject<SidebarChange> = new BehaviorSubject(('default' as SidebarChange));

    constructor(){ }

    get editMode(): Observable<SidebarChange> {
        return this._editMode.asObservable();
    }

    changeBySelection(selection: any){
        
        // determine if selection is undefined, if undefined reset to default sidebar
        const new_state = selection ? 'edit' : 'default';
        // it is necessarry to cast the string
        this.emitState((new_state as SidebarChange))
    }

    changeSidebarState(state){
       
        // validation check if parameter is in correct form
        if(state.match(/^(default|edit|recommend)$/)){
            this.emitState(state)
        } else {
            console.error('the given sidebar state is not knwon, please check if the value is: edit | recommend | default')
        }
    }

    changeSidebarToDefault(){
        this.emitState(('default' as SidebarChange))
    }

/* 
    // no yet needed but, would be a safer api, as no sidebar states can be emitted to this 
    // service, only expected behavior can be called. 

    changeSidebarToEdit(){

    }

    changeSidebarToRecommend() {
        
    }

 */

    private emitState(state: SidebarChange){
        this._editMode.next(state);
    }
}