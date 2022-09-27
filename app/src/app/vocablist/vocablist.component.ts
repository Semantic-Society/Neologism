import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {saveAs} from 'file-saver';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {Ivocabulary} from '../../../api/models';
import {AccessManagement} from '../services/access-management.service';
import {VocabulariesService} from '../services/vocabularies.service';
import {AddUserModalComponent} from './components/add-user-modal/add-user-modal.component';

@Component({
    selector: 'app-vocablist',
    templateUrl: './vocablist.component.html',
    styleUrls: ['./vocablist.component.css']
})

export class VocablistComponent implements OnInit {
   dataSource: Observable<Ivocabulary[]>; // new VocabularyDataSource();

   vocabForm = {
       name: '',
       description: '',
       uriPrefix: '',
       // classes: []
   };
  displayedColumns = ['name', 'authors', 'description', 'uriPrefix', 'actions'];

  constructor(
     private router: Router,
     private accessMngmt: AccessManagement,
     public dialog: MatDialog,
     private vocabService: VocabulariesService) { }

  ngOnInit() {
      this.dataSource = this.vocabService.getVocabularies();
      this.dataSource.subscribe((x) => console.log(x));
  }

  addVocabulary() {
      this.vocabService.createVocabulary(
          this.vocabForm.name,
          this.vocabForm.description,
          this.vocabForm.uriPrefix
      );
  }

  deleteVocab(id) {
      this.vocabService.deleteVocabulary(id);
  }

  openVocab(id: string) {
      window.open('../v/' + id);
  }

  addPersonToVocab(dataSource) {
      this.dialog.open(AddUserModalComponent, {
          height: '400px',
          width: '600px',
          data: {vocabId: dataSource._id}
      });
  }

  downloadVocab(id: string, name: string) {
      const subscription = this.vocabService.getClassesWithProperties(id).pipe(
      // this delay is artificial to get the latest, final result and not an intermediary.
      // Using 'last would be more natural, but does not seem to work (this is a query on a life collection).
          debounceTime(100)
      ).subscribe(
          (classes) => {
              console.log('there: ', classes);
              subscription.unsubscribe();
              let rdf = '';
              const a = '<http://www.w3.org/2000/01/rdf-schema#type> ';
              const domain = '<http://www.w3.org/2000/01/rdf-schema#domain> ';
              const range = '<http://www.w3.org/2000/01/rdf-schema#range> ';
              const rdfsclass = '<http://www.w3.org/2000/01/rdf-schema#Class> ';
              const property = '<http://www.w3.org/2000/01/rdf-schema#Property> ';
              const allProps = Object.create(null);
              classes.forEach((clazz) => {
                  const classURI = '<' + clazz.URI + '> ';
                  rdf += classURI + a + rdfsclass + '.\n';
                  clazz.properties.forEach((prop) => {
                      const propURI = '<' + prop.URI + '> ';
                      allProps[propURI] = propURI;
                      const rangeClassURI = '<' + prop.range.URI + '>';
                      rdf += propURI + domain + classURI + ' .\n';
                      rdf += propURI + range + rangeClassURI + ' .\n';
                  });
              });
              // allProps created with Object.create(null);
              // eslint-disable-next-line guard-for-in
              for (const prop in allProps) {
                  rdf += prop + a + property + ' .\n';
              }

              const blob = new Blob([rdf], { type: 'text/plain' });
              saveAs(blob, name + '.rdf');
          }
      );
  }
}
