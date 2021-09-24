import { inject, TestBed } from '@angular/core/testing';

import { VocabulariesService } from './vocabularies.service';

describe('VocabulariesService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [VocabulariesService]
        });
    });

    it('should be created', inject([VocabulariesService], (service: VocabulariesService) => {
        expect(service).toBeTruthy();
    }));
});
