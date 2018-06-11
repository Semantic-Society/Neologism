import { MongoObservable } from 'meteor-rxjs';
import { Iclass, Iproperty, Ivocabulary } from '../models';

export const Vocabularies = new MongoObservable.Collection<Ivocabulary>('vocabularies');
export const Classes = new MongoObservable.Collection<Iclass>('classes');
export const Properties = new MongoObservable.Collection<Iproperty>('properties');
