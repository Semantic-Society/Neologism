import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { VocabulariesService } from '../../../app/services/vocabularies.service';
import { combineLatest, Observable } from 'rxjs';
import { startWith, debounceTime, tap, take, map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddUserModalComponent } from '../../../app/vocablist/components/add-user-modal/add-user-modal.component';
import { Router } from '@angular/router';
import { Iuser } from '../../../../api/models';
import { RemoveUserModalComponent } from '../../../app/vocablist/components/remove-user-modal/remove-user-modal.component';
import { N3Codec } from '../../../app/mxgraph/N3Codec';
@Component({
    selector: 'app-vocabulary-list',
    templateUrl: './vocabulary-list.component.html',
    styleUrls: ['./vocabulary-list.component.scss'],
})
export class VocabularyListComponent implements OnInit {
    public context$: Observable<any>;
    public loggedInUser: Iuser;
    @Output() totalVocab = new EventEmitter<number>();

    constructor(
        private router: Router,
        private vocabService: VocabulariesService,
        private modalService: NzModalService,
        public dialog: MatDialog,) {
        this.context$ = this.vocabService.getVocabularies().pipe(tap(vocabularies => this.totalVocab.emit(vocabularies.length)));
    }

    deleteVocabulary(vocab_id: string) {
        this.modalService.confirm({
            nzTitle: '<i>Do you really want to delete this vocabulary?</i>',
            nzContent: '<b>You will lose all access to this vocabulary. This action cannot be undone.</b>',
            nzOnOk: () => this.vocabService.deleteVocabulary(vocab_id)
        });
    }

    /**
     *
     * @param vocab_id TODO (Johannes): TBD
     */
    editVocabulary(vocab_id: string) {
    }

    openDownloadDialog(id: string, name: string): void {
        const dialogRef = this.dialog.open(DownloadBtnDialog, {
            height: "400px",
            width: "600px",
            data: {option: 0},
        });

        dialogRef.afterClosed().subscribe(result => {
        

            this.vocabService.getClassesWithProperties(id).pipe(take(1)).subscribe(
                (classesWithProps) => {
                    if (result == 0) {
                        N3Codec.serializeWithProximity(id, classesWithProps, (content) => {
                            const blob = new Blob([content], { type: 'text/plain' });
                            saveAs(blob, name + '.rdf');
                            
                        });
                    }
                    if (result == 1){
                        N3Codec.serialize(id, classesWithProps, (content) => {
                            const blob = new Blob([content], { type: 'text/plain' });
                            saveAs(blob, name + '.rdf');
                           
                        });
                    }

                }
            );
        });

    }
    downloadVocab(id: string, name: string) {
        console.log('downloading vocabulary: ' + id + '...');
        this.openDownloadDialog(id, name)

    }


    openVocabulary(vocab_id: string) {
        this.router.navigateByUrl('edit/' + vocab_id);
    }

    addPersonToVocab(vocab_id: string) {
        const dialogRef = this.dialog.open(AddUserModalComponent, {
            height: "400px",
            width: "600px",
            data: { vocabId: vocab_id }
        });
    }

    ngOnInit() {
        Tracker.autorun(() => {
            this.loggedInUser = Meteor.user();

        });

    }

    removePersonFromVocab(vocab_id: string) {
        const dialogRef = this.dialog.open(RemoveUserModalComponent, {
            height: "400px",
            width: "600px",
            data: { vocabId: vocab_id }
        });
    }

    publishVocab(vocabID: string) {
        console.log('publishing vocabulary: ' + vocabID + '...');
        this.vocabService.publishVocab(vocabID);
    }

}
export interface DialogData {
    option: boolean
  }
  

@Component({
    selector: 'dialog-download',
    template: `
    <h1 mat-dialog-title>Download RDF for ontology</h1>
  <div mat-dialog-content>
    Simple Download excludes proximity information 
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="close(0)" cdkFocusInitial>Download + proximity</button>
    <button mat-button (click)="close(1)"> Download</button>
    <button mat-button (click)="onNoClick()">No Thanks</button>
  </div>
  `,
})
export class DownloadBtnDialog {
    constructor(
        public dialogRef: MatDialogRef<DownloadBtnDialog>,
      ) { }

        close(val:any){
            this.dialogRef.close(val); 
        }
        onNoClick(): void {
            this.dialogRef.close();
          }
}