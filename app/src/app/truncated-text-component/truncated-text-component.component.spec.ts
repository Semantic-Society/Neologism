import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TruncatedTextComponentComponent } from './truncated-text-component.component';

describe('TruncatedTextComponentComponent', () => {
    let component: TruncatedTextComponentComponent;
    let fixture: ComponentFixture<TruncatedTextComponentComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ TruncatedTextComponentComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TruncatedTextComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
