import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VocabularyListComponent } from './vocabulary-list.component';

describe('VocabularyListComponent', () => {
    let component: VocabularyListComponent;
    let fixture: ComponentFixture<VocabularyListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ VocabularyListComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VocabularyListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
