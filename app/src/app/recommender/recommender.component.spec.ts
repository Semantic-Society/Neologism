import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecommenderComponent } from './recommender.component';

describe('RecommenderComponent', () => {
  let component: RecommenderComponent;
  let fixture: ComponentFixture<RecommenderComponent>;

  beforeEach(waitForAsync(() => {
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
