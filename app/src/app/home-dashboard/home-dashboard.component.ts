import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateVocabModalComponent } from './create-vocab-modal/create-vocab-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VocabulariesService } from '../services/vocabularies.service';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss']
})

export class HomeDashboardComponent implements OnInit {

  isCollapsed = false;
  triggerTemplate = null;
  loggedInUser: Meteor.User
  @ViewChild('trigger', { static: true }) customTrigger: TemplateRef<void>;
  private vocabCount: Number = 0
  constructor(
    private router: Router,
    private vocabService: VocabulariesService,
    private modalService: NzModalService) {

  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }

  ngOnInit() {
    Tracker.autorun(() => {
      this.loggedInUser = Meteor.user()


    })

  }

  onLogout(): void {
    Meteor.logout();
    this.router.navigateByUrl('/login')
  }

  createVocabulary(): void {
    let GRestriction = Meteor.user().emails[0].address === environment.guestUserName && this.vocabCount > environment.gMaxVocab;

    if (GRestriction)
      return;

    const modal = this.modalService.create({
      nzTitle: 'Create new vocabulary',
      nzContent: CreateVocabModalComponent,

      nzFooter: null
    });

    // Return a result when closed
    modal.afterClose.subscribe((result) => {

      if (!result || result.name === undefined)
        return;


      this.vocabService.createVocabulary(
        result.name,
        result.description,
        result.uri
      ).subscribe((response) => {
        this.router.navigateByUrl('edit/' + response.vocabId);
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
        // Handle error
      });
    });

  }

  updateListLength(count: number) {
    this.vocabCount = count

  }

}