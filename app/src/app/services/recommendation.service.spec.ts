/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

import { inject, TestBed, waitForAsync } from '@angular/core/testing';
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
