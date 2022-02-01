import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Observable} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {Iuser} from '../../../../api/models';
import {N3Codec} from '../../mxgraph/N3Codec';
import {VocabulariesService} from '../../services/vocabularies.service';
import {AddUserModalComponent} from '../../vocablist/components/add-user-modal/add-user-modal.component';
import {RemoveUserModalComponent} from '../../vocablist/components/remove-user-modal/remove-user-modal.component';

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
    public dialog: MatDialog, ) {
      this.context$ = this.vocabService.getVocabularies().pipe(tap((vocabularies) => this.totalVocab.emit(vocabularies.length)));
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

  downloadVocab(id: string, name: string) {
      console.log('downloading vocabulary: ' + id + '...');

      this.vocabService.getClassesWithProperties(id).pipe(take(1)).subscribe(
          (classesWithProps) => {
              N3Codec.serialize(id, classesWithProps, (content) => {
                  const blob = new Blob([content], { type: 'text/plain' });
                  saveAs(blob, name + '.rdf');
                  return;
              });
          }
      );
  }

  openVocabulary(vocab_id: string) {
      this.router.navigateByUrl('edit/' + vocab_id);
  }

  addPersonToVocab(vocab_id: string) {
      const dialogRef = this.dialog.open(AddUserModalComponent, {
          height: '400px',
          width: '600px',
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
          height: '400px',
          width: '600px',
          data: { vocabId: vocab_id }
      });
  }

  publishVocab(vocabID: string) {
      console.log('publishing vocabulary: ' + vocabID + '...');
      this.vocabService.publishVocab(vocabID);
  }
}
