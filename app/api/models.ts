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
  createdOn: Date;
}

export interface Iproperty {
  _id?: meteorID; // Mongo generated ID
  name: string;
  type?: PropertyType;
  description: string;
  URI: string;
  range: meteorID | string;
  createdOn: Date;
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
    createdOn: Date;
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
  createdOn: Date;
}

export enum PropertyType {
  Object = 'owl:ObjectProperty',
  Data = 'owl:DatatypeProperty',
  subclass = 'rdfs:subClassOf'
}

export enum PropertyType2 {
  'owl:ObjectProperty',
  'owl:DatatypeProperty',
  'rdfs:subClassOf'
}


const xsdDataTypes = [

  'xsd:anyURI',

  'xsd:base64Binary',

  'xsd:boolean',

  'xsd:byte',

  'xsd:date',

  'xsd:dateTime',

  'xsd:decimal',

  'xsd:derivationControl',

  'xsd:double',

  'xsd:duration',

  ' xsd:ENTITIES',

  ' xsd:ENTITY',

  ' xsd:float',

  ' xsd:gDay',

  'xsd:gMonth',

  'xsd:gMonthDay',

  'xsd:gYear',

  'xsd:gYearMonth',

  'xsd:hexBinary',

  'xsd:ID',

  'xsd:IDREF',

  'xsd:IDREFS',

  'xsd:int',

  'xsd:integer',

  'xsd:language',

  'xsd:long',

  'xsd:Name',

  'xsd:NCName',

  'xsd:negativeInteger',

  'xsd:NMTOKEN',

  'xsd:NMTOKENS',

  'xsd:nonNegativeInteger',

  'xsd:nonPositiveInteger',

  'xsd:normalizedString',

  'xsd:NOTATION',

  'xsd:positiveInteger',

  'xsd:QName',

  'xsd:short',

  'xsd:simpleDerivationSet',

  'xsd:string',

  'xsd:time',

  'xsd:token',

  'xsd:unsignedByte',

  'xsd:unsignedInt',

  'xsd:unsignedLong',

  'xsd:unsignedShort',

  'rdfs:Literal'

];

export { xsdDataTypes };
