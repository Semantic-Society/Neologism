/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { VocablistComponent } from './vocablist.component';

describe('VocablistComponent', () => {
  let component: VocablistComponent;
  let fixture: ComponentFixture<VocablistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VocablistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocablistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
