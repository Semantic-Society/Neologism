/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StandardViewComponent } from './standardView.component';

describe('StandardViewComponent', () => {
  let component: StandardViewComponent;
  let fixture: ComponentFixture<StandardViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
