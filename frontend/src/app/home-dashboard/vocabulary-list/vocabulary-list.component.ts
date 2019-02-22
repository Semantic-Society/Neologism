import { Component, OnInit } from '@angular/core';
import { VocabulariesService } from '../../../app/services/vocabularies.service';
import { Observable } from 'rxjs';
import { startWith, debounceTime, tap, take } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-vocabulary-list',
  templateUrl: './vocabulary-list.component.html',
  styleUrls: ['./vocabulary-list.component.scss']
})
export class VocabularyListComponent implements OnInit {
  public dataSet: Observable<any>;
  constructor( 
    private vocabService: VocabulariesService,
    private modalService: NzModalService) {
    this.dataSet = this.vocabService.getVocabularies()
      .pipe(startWith([]));

  }

  addUserToVocabulary(){

  }

  deleteVocabulary(vocab_id: string){
    this.modalService.confirm({
      nzTitle  : '<i>Do you Want to delete this vocabulary?</i>',
      nzContent: '<b>You will loose all access to this vocabulary</b>',
      nzOnOk   : () => this.vocabService.deleteVocabulary(vocab_id)
    });
  }

  editVocabulary(vocab_id: string){
    
  }

  downloadVocab(id: string, name: string) {
    console.log('downloading vocabulary: ' + id + '...');

    if (name === '' || name === undefined ) name = 'vocab-' + id;

    this.vocabService.getClassesWithProperties(id).pipe(
      // this delay is artifical to get the latest, final result and not an intermediary.
      // Using 'last would be more natural, but does not seem to work (this is a query on a life collection).
      tap(x => console.log(x)),
      debounceTime(100),
      take(1)
      ).subscribe(
        classes => this.saveClassesWithPropertiesAsFile(classes));

  }


  openVocabulary(vocab_id: string) {
    window.open('../v/' + vocab_id);
  }

  addVocabulary(vocabForm: any) {

  }

  ngOnInit() {
  }

  private saveClassesWithPropertiesAsFile(classes) {
      console.error('Fails in vocabulary-list.component.ts, saveClassesWithPropertiesAsFile()')
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
      // tslint:disable-next-line:forin
      for (const prop in allProps) {
        rdf += prop + a + property + ' .\n';
      }

      const blob = new Blob([rdf], { type: 'text/plain' });
      saveAs(blob, name + '.rdf');
  }

}
