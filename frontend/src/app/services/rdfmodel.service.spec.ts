/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RdfmodelService } from './rdfmodel.service';

describe('Service: Rdfmodel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RdfmodelService]
    });
  });

  it('should ...', inject([RdfmodelService], (service: RdfmodelService) => {
    expect(service).toBeTruthy();
  }));
});
