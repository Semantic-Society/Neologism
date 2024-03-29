import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MxgraphComponent } from './mxgraph.component';

describe('MxgraphComponent', () => {
    let component: MxgraphComponent;
    let fixture: ComponentFixture<MxgraphComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ MxgraphComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MxgraphComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
