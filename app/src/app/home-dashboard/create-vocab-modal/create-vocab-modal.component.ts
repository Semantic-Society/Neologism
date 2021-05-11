import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-create-vocab-modal',
  templateUrl: './create-vocab-modal.component.html',
  styleUrls: ['./create-vocab-modal.component.scss']
})
export class CreateVocabModalComponent implements OnInit {

  validateForm: FormGroup;

  constructor( private modal: NzModalRef,private fb: FormBuilder) { }



  ngOnInit(): void {
    this.validateForm = this.fb.group({
      description: [''],
      uri: [`http://w3id.org/neologism/{vocabname-in-lowercase}#`, [Validators.required]],
      name: [null, [Validators.required]],
      access: ['public', [Validators.required]],
    
    });
  }

  closeModal(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    this.modal.destroy(this.validateForm.value);
  }

  cancelModal(e: MouseEvent){
    e.preventDefault();
    this.modal.destroy(null)
  }
  change(value:string){    
    this.validateForm.controls['uri'].setValue(`http://w3id.org/neologism/${encodeURIComponent(value.toLocaleLowerCase())}#`)

 }
}
