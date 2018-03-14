/* tslint:disable:no-unused-variable */

import { async, inject, TestBed } from '@angular/core/testing';
import { RecommendationService } from './recommendation.service';

describe('Service: Recommendation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecommendationService]
    });
  });

  it('should ...', inject([RecommendationService], (service: RecommendationService) => {
    expect(service).toBeTruthy();
  }));
});