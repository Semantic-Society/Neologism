import { MongoObservable } from 'meteor-rxjs';
import { Ivocabulary } from '../models';

export const Vocabularies = new MongoObservable.Collection<Ivocabulary>('vocabularies');
