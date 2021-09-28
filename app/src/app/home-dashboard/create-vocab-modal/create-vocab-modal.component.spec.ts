import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateVocabModalComponent } from './create-vocab-modal.component';

describe('CreateVocabModalComponent', () => {
    let component: CreateVocabModalComponent;
    let fixture: ComponentFixture<CreateVocabModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ CreateVocabModalComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateVocabModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
