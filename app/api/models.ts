import { Meteor } from 'meteor/meteor';
/**
 * These types are only to be used for communication between server and client.
 *
 * NOT in the frontend application otherwise.
 */

export interface Iuser extends Meteor.User {
  profile?: any;
}

export type meteorID = string;
export type userID = meteorID;

export interface IpropertyMeta {
  name: string;
  URI: string;
  range: string;
  comment: string;
}

export interface Ivocabulary {
  _id?: meteorID; // Mongo generated ID
  name: string;
  description: string;
  creator: meteorID;
  authors: userID[];
  uriPrefix: string;
  public: boolean;
  // version: string;
  classes: meteorID[]; // List of all classes in the vocab
}

export interface Iclass {
  _id?: meteorID; // Mongo generated ID
  name: string;
  description: string;
  URI: string;

  properties: meteorID[];
  position: {
    x: number;
    y: number;
  };
  skos: {
    closeMatch: string[];
    exactMatch: string[];
  };
}

export interface Iproperty {
  _id?: meteorID; // Mongo generated ID
  name: string;
  description: string;
  URI: string;
  range: meteorID;
}

export interface IvocabularyExtended extends Ivocabulary {
  authorsEmailAddress: string;
}
