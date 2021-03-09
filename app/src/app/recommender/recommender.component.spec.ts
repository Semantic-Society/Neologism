import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommenderComponent } from './recommender.component';

describe('RecommenderComponent', () => {
  let component: RecommenderComponent;
  let fixture: ComponentFixture<RecommenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
