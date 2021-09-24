import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MxGraphEditorComponent } from './mx-graph-editor.component';

describe('MxGraphEditorComponent', () => {
    let component: MxGraphEditorComponent;
    let fixture: ComponentFixture<MxGraphEditorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ MxGraphEditorComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MxGraphEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
