import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdfUploaderComponent } from './rdf-uploader.component';

describe('RdfUploaderComponent', () => {
    let component: RdfUploaderComponent;
    let fixture: ComponentFixture<RdfUploaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ RdfUploaderComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RdfUploaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
