import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {AccessManagement} from '../../../services/access-management.service';

@Component({
    selector: 'app-add-user-modal',
    templateUrl: './add-user-modal.component.html',
    styleUrls: ['./add-user-modal.component.scss']
})
export class AddUserModalComponent implements OnInit {

  addGroup: BehaviorSubject<any[]> = new BehaviorSubject([]);
  autoUsers: Observable<any>;

  keyUp = new Subject<string>();
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];

  constructor(
    private accessService: AccessManagement,
    public dialogRef: MatDialogRef<AddUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

      this.setupAutoComp();
  }

  ngOnInit() { }

  setupAutoComp() {
      this.autoUsers = this.keyUp.asObservable()
          .pipe(
              map((event: any) => event.target.value),
              debounceTime(300),
              distinctUntilChanged(),
              switchMap((search) => this.accessService.getUsers(search)),
              startWith([])
          );
  }

  addToAddGroup(user) {
      const tmp_users = this.addGroup.getValue();
      const new_users = [...tmp_users, user];

      this.addGroup.next(new_users);
  }

  removeUserAddGroup(user) {
      const tmp_users = this.addGroup.getValue();
      const new_users = tmp_users.filter((remove) => user !== remove);

      this.addGroup.next(new_users);
  }

  addUsers() {
      const userIds = this.addGroup.getValue().map((user) => user._id);
      this.accessService.addUsersVocab(userIds, this.data.vocabId);
  }

  closeDialog() {
      this.dialogRef.close();
  }
}
