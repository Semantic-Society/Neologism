import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NamedNode, Store,DataFactory } from 'n3';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { N3Codec } from '../mxgraph/N3Codec';
import { VocabulariesService } from '../services/vocabularies.service';

@Component({
    selector: 'app-rdf-uploader',
    template: `
  <nz-upload [(nzFileList)]="fileList" [nzBeforeUpload]="beforeUpload">
  <button nz-button>
    <i nz-icon nzType="upload"></i>
    Select File
  </button>
</nz-upload>
  `,
    styles: [
    ]
})
export class RdfUploaderComponent implements OnInit {


  uploading = false;
  fileList: NzUploadFile[] = [];
  beforeUpload = (file: NzUploadFile): boolean => {
      if(!this.vocabService.isEligibleForCreatingVocab()){
          this.msg.warning("Upload failed:Vocabularies Limit Exceeded");
          return false;
      }

      const reader = new FileReader();

      reader.onload = e => {

          this.n3Util.deserialize(e.target.result,(store: Store)=>{
              const importData= this.processImport(store);
              console.log(importData);

              const modal = this.vocabService.openImportVocabForm(importData.meta);

              // Returns a result when closed
              modal.afterClose.subscribe((result) => {

                  if (!result || result.name === undefined)
                      return;


                  this.vocabService.createVocabulary(
                      result.name,
                      result.description,
                      result.uri
                  ).subscribe((response) => {
                      this.vocabService.fillVocabularyWithData(importData,response.vocabId);
                      this.router.navigateByUrl('edit/' + response.vocabId);
                  }, (err) => {
                      console.log(err);
                  });
              });


          });

      };
      reader.readAsText(file as any);

      // Prevent upload
      return false;
  };

  /**
   *
   * @param store
   *
   */
  processImport(store: Store) {
      const meta= this.n3Util.getMeta(store);
      const classess=this.n3Util.getClasses(store);
      const subclasses= this.n3Util.getSubClassRelations(store);
      return {
          meta,
          classes:classess,
          subclasses
      };
  }

  constructor(private msg: NzMessageService,private n3Util: N3Codec
      ,private vocabService: VocabulariesService,
    private router: Router) { }

  ngOnInit(): void {
  }



}
