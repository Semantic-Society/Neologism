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
  domain: string;
}

export interface Iclass {
  _id?: meteorID; // Mongo generated ID
  name: string;
  description: string;
  URI: string;
  isDataTypeVertex?: boolean;
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
  type?: PropertyType;
  description: string;
  URI: string;
  range: meteorID;
  rangeName?: string;
}

export interface IvocabularyExtended extends Ivocabulary {
  authorsEmailAddress: string;
}


export interface IClassWithProperties {
  _id: string; // Mongo generated ID
  name: string;
  description: string;
  URI: string;
  isDataTypeVertex?: boolean;
  properties: Array<{
    _id: string; // Mongo generated ID
    name: string;
    type?: PropertyType;
    description: string;
    URI: string;
    range: IClassWithProperties; // these MUST be in the same vocabulary!
  }>;
  position: {
    x: number;
    y: number;
  };
  skos: {
    closeMatch: string[];
    exactMatch: string[];
  };
}

export enum PropertyType {
  Object = 'owl:ObjectProperty',
  Data = 'owl:DatatypeProperty'
}


const xsdDataTypes = [

  'anyURI',

  'base64Binary',

  'boolean',

  'byte',

  'date',

  'dateTime',

  'decimal',

  'derivationControl',

  'double',

  'duration',

  'ENTITIES',

  'ENTITY',

  'float',

  'gDay',

  'gMonth',

  'gMonthDay',

  'gYear',

  'gYearMonth',

  'hexBinary',

  'ID',

  'IDREF',

  'IDREFS',

  'int',

  'integer',

  'language',

  'long',

  'Name',

  'NCName',

  'negativeInteger',

  'NMTOKEN',

  'NMTOKENS',

  'nonNegativeInteger',

  'nonPositiveInteger',

  'normalizedString',

  'NOTATION',

  'positiveInteger',

  'QName',

  'short',

  'simpleDerivationSet',

  'string',

  'time',

  'token',

  'unsignedByte',

  'unsignedInt',

  'unsignedLong',

  'unsignedShort'

];

export {xsdDataTypes};
