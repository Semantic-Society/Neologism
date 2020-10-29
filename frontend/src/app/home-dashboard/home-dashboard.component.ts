import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateVocabModalComponent } from './create-vocab-modal/create-vocab-modal.component';
import { NzModalService } from 'ng-zorro-antd';
import { VocabulariesService } from '../services/vocabularies.service';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.scss']
})

export class HomeDashboardComponent implements OnInit {

  isCollapsed = false;
  triggerTemplate = null;
  loggedInUser:Meteor.User
  @ViewChild('trigger') customTrigger: TemplateRef<void>;

  constructor(
    private router: Router, 
    private vocabService: VocabulariesService, 
    private modalService: NzModalService){

  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }

  ngOnInit(){
    Tracker.autorun(() => {
        this.loggedInUser=Meteor.user()
      

  })
    
  }

  onLogout(): void {
    Meteor.logout();
    this.router.navigateByUrl('/login')
  }

  createVocabulary(): void {
    const modal = this.modalService.create({
      nzTitle: 'Create new Vocabulary',
      nzContent: CreateVocabModalComponent,
      nzComponentParams: {
        description: '',
        name: '',
        uri: '',
        access: undefined
      },
      nzFooter: [{
        label: 'Save vocabulary',
        onClick: (componentInstance) => {
          componentInstance.closeModal();
        }
      }]
    });

    // Return a result when closed
    modal.afterClose.subscribe((result) => {
      if(result.name===undefined)
      return;
      this.vocabService.createVocabulary(
        result.name,
        result.description,
        result.uri
      );
    });

  }

}