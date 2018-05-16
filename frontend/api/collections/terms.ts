import { MongoObservable } from 'meteor-rxjs';
import { Iterm } from '../models';


export const Terms = new MongoObservable.Collection<Iterm>('terms');
