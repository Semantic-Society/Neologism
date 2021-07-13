import { Component, OnInit } from '@angular/core';
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
      this.msg.warning("Upload failed:Vocabularies Limit Exceeded")
      return false;
    }

    const reader = new FileReader();

    reader.onload = e => {
      console.log(e.target.result);
      this.n3Util.deserialize(e.target.result,(quads:any[])=>{
        console.log(quads)
    
        
      })
    
    };
    reader.readAsText(file as any);

    // Prevent upload
    return false;
  };

  constructor(private msg: NzMessageService,private n3Util:N3Codec,private vocabService:VocabulariesService) { }

  ngOnInit(): void {
  }

}
