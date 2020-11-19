import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-create-vocab-modal',
  templateUrl: './create-vocab-modal.component.html',
  styleUrls: ['./create-vocab-modal.component.scss']
})
export class CreateVocabModalComponent implements OnInit {
  @Input() description: string;
  @Input() uri: string;
  @Input() name: string;
  @Input() access: 'private' | 'public';

  constructor( private modal: NzModalRef) { }

  ngOnInit() {
      this.uri=`http://w3id.org/neologism/{vocabname-in-lowercase}#`
  }

  closeModal(): void {
    this.modal.destroy({ 
      description: this.description,
      uri: this.uri,
      name: this.name,
      access: this.access
    });
  }

  change(value:string){    
    this.uri=`http://w3id.org/neologism/${value.toLocaleLowerCase()}#`

 }
}
