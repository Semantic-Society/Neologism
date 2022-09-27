import {Injectable} from '@angular/core';
import {MeteorObservable, zoneOperator} from 'meteor-rxjs';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class AccessManagement {
    users: BehaviorSubject<any> =  new BehaviorSubject([]);

    constructor() {
    }

    getUsers(query): Observable<any> {
        return Observable.create((observer) => {
            MeteorObservable.call('users-without-self.get', query)
                .pipe(zoneOperator())
                .subscribe(
                    (users) => observer.next(users),
                    (err) => observer.error(err),
                    () => observer.complete()
                );
        });
    }

    addUsersVocab(userIds: string[], vocabId: string) {
        console.log('meteor-cal');
        MeteorObservable.call('vocabulary.addAuthors', userIds, vocabId)
            .pipe(zoneOperator())
            .subscribe((response) => {
                console.log(response, 'response');
                // Handle success and response from server!
            }, (err) => {
                console.log(err);
                // Handle error
            });
    }

    removeUsersVocab(userIds: string[], vocabId: string) {
        console.log('meteor-cal');
        MeteorObservable.call('vocabulary.removeAuthors', userIds, vocabId)
            .pipe(zoneOperator())
            .subscribe((response) => {
                console.log(response, 'response');
                // Handle success and response from server!
            }, (err) => {
                console.log(err);
                // Handle error
            });
    }
}
