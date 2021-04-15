import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { VocabulariesService } from '../../../app/services/vocabularies.service';
import { combineLatest, Observable } from 'rxjs';
import { startWith, debounceTime, tap, take, map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MatDialog } from '@angular/material/dialog';
import { AddUserModalComponent } from '../../../app/vocablist/components/add-user-modal/add-user-modal.component';
import { Router } from '@angular/router';
import { HTTP } from 'meteor/http'
import { environment } from '../../../environments/environment';
import { Iuser } from '../../../../api/models';
import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { RemoveUserModalComponent } from '../../../app/vocablist/components/remove-user-modal/remove-user-modal.component';

@Component({
  selector: 'app-vocabulary-list',
  templateUrl: './vocabulary-list.component.html',
  styleUrls: ['./vocabulary-list.component.scss']
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
    this.context$ = this.vocabService.getVocabularies().pipe(map(vocabulary => {
      return vocabulary;
    }),tap(vocabularies=>this.totalVocab.emit(vocabularies.length)));

  }

  addUserToVocabulary() {

  }

  deleteVocabulary(vocab_id: string) {
    this.modalService.confirm({
      nzTitle: '<i>Do you Want to delete this vocabulary?</i>',
      nzContent: '<b>You will loose all access to this vocabulary</b>',
      nzOnOk: () => this.vocabService.deleteVocabulary(vocab_id)
    });
  }

  editVocabulary(vocab_id: string) {
  }

  downloadVocab(id: string, name: string) {
    console.log('downloading vocabulary: ' + id + '...');
    HTTP.get(`${environment.api.base}vocabulary/${id}`, {
    }, function (err, res) {
      if(err){
        console.log(err)
        return;
      }
      const blob = new Blob([res.content], { type: 'text/plain' });
      saveAs(blob, name + '.rdf');
      return;
    });

  }


  openVocabulary(vocab_id: string) {
    this.router.navigateByUrl('edit/' + vocab_id);
  }

  addVocabulary(vocabForm: any) {

  }

  addPersonToVocab(vocab_id: string) {
    let dialogRef = this.dialog.open(AddUserModalComponent, {
      height: '400px',
      width: '600px',
      data: { vocabId: vocab_id }
    });
  }
  becomeCreator(vocab_id: string) {
    MeteorObservable.call('vocabulary.assign-creator.self', vocab_id)
      .pipe(zoneOperator())
      .subscribe()
  }

  ngOnInit() {
    Tracker.autorun(() => {
      this.loggedInUser = Meteor.user()

    })

  }
  
  removePersonFromVocab(vocab_id: string) {
    let dialogRef = this.dialog.open(RemoveUserModalComponent, {
      height: '400px',
      width: '600px',
      data: { vocabId: vocab_id }
    });
  }

}
