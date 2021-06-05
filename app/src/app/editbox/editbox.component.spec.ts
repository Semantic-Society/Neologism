import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditboxComponent } from './editbox.component';

describe('EditboxComponent', () => {
  let component: EditboxComponent;
  let fixture: ComponentFixture<EditboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
