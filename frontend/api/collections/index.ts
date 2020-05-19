import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Iclass, Iproperty, Iuser, Ivocabulary } from '../models';

export const Users = MongoObservable.fromExisting<Iuser>(Meteor.users);
export const Vocabularies = new MongoObservable.Collection<Ivocabulary>('vocabularies');
export const Classes = new MongoObservable.Collection<Iclass>('classes');
export const Properties = new MongoObservable.Collection<Iproperty>('properties');
