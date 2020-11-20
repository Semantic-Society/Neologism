import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
import { AccessManagement } from '../../../services/access-management.service';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, flatMap, startWith, tap, switchMap } from 'rxjs/operators';
import { Users, Vocabularies } from '../../../../../api/collections';
import { Iuser } from '../../../../../api/models';

@Component({
  selector: 'app-remove-user-modal',
  templateUrl: './remove-user-modal.component.html',
  styleUrls: ['./remove-user-modal.component.scss']
})
export class RemoveUserModalComponent {

  removeGroup: BehaviorSubject<Array<any>> = new BehaviorSubject([])
  autoUsers: Observable<any>
  contributors: Array<Iuser>
  toRemove: Array<Iuser>
  keyUp = new Subject<string>()
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];

  constructor(
    private accessService: AccessManagement,
    public dialogRef: MatDialogRef<RemoveUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.contributors = []
    this.toRemove = []
    Vocabularies.findOne({ _id: this.data.vocabId }, { fields: { authors: 1 } })
      .authors
      .forEach(authorId =>
        this.contributors
          .push(
            Users.findOne({ _id: authorId })
          ))
    this.removeGroup.next(this.contributors)
  }

  removeUserFromGroup(user) {
    const tmp_users = this.removeGroup.getValue()
    const toRemove = tmp_users.find(remove => user === remove)
    const new_users = tmp_users.filter(remove => user !== remove)
    this.toRemove.push(toRemove)
    this.removeGroup.next(new_users)
  }

  reset() {
    this.removeGroup.next(this.contributors)
    this.toRemove = []
  }

  removeUsers() {
    const userIds = this.toRemove
      .map(user => user._id)

    this.accessService.removeUsersVocab(userIds, this.data.vocabId)
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
