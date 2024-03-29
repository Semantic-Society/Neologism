import {Component, Inject} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Observable} from 'rxjs';
import {Users, Vocabularies} from '../../../../../api/collections';
import {Iuser} from '../../../../../api/models';
import {AccessManagement} from '../../../services/access-management.service';

@Component({
    selector: 'app-remove-user-modal',
    templateUrl: './remove-user-modal.component.html',
    styleUrls: ['./remove-user-modal.component.scss']
})
export class RemoveUserModalComponent {

  removeGroup: BehaviorSubject<any[]> = new BehaviorSubject([]);
  autoUsers: Observable<any>;
  contributors: Iuser[];
  toRemove: Iuser[];
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];

  constructor(
    private accessService: AccessManagement,
    public dialogRef: MatDialogRef<RemoveUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

      this.contributors = [];
      this.toRemove = [];
      Vocabularies.findOne({ _id: this.data.vocabId }, { fields: { authors: 1 } })
          .authors
          .forEach((authorId) =>
              this.contributors
                  .push(
                      Users.findOne({ _id: authorId })
                  ));
      this.removeGroup.next(this.contributors);
  }

  removeUserFromGroup(user) {
      const tmp_users = this.removeGroup.getValue();
      const toRemove = tmp_users.find((remove) => user === remove);
      const new_users = tmp_users.filter((remove) => user !== remove);
      this.toRemove.push(toRemove);
      this.removeGroup.next(new_users);
  }

  reset() {
      this.removeGroup.next(this.contributors);
      this.toRemove = [];
  }

  removeUsers() {
      const userIds = this.toRemove
          .map((user) => user._id);

      this.accessService.removeUsersVocab(userIds, this.data.vocabId);
  }

  closeDialog() {
      this.dialogRef.close();
  }
}
