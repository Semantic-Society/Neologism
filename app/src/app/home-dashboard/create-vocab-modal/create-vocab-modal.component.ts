import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { transformURI } from '../../shared/validator.dup.URI';
@Component({
    selector: 'app-create-vocab-modal',
    templateUrl: './create-vocab-modal.component.html',
    styleUrls: ['./create-vocab-modal.component.scss']
})
export class CreateVocabModalComponent {

    @Input() validateForm: FormGroup;

    constructor(private modal: NzModalRef) { }

    closeModal(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }

        this.modal.destroy(this.validateForm.value);
    }

    cancelModal(e: MouseEvent) {
        e.preventDefault();
        this.modal.destroy(null);
    }
    change(value: string) {
        this.validateForm.controls['uri'].setValue(`http://w3id.org/neologism/${transformURI(value)}#`);

    }
}
