export type meteorID = string;

export interface IpropertyMeta {
  name, URI, range, comment
}

export interface Ivocabulary {
  _id?: meteorID; //Mongo generated ID
  name: string;
  description: string;
  authors:string[];
  uriPrefix: string;
  classes?: meteorID[]; // List of all classes in the vocab
}

export interface Iclass {
  _id?: meteorID; //Mongo generated ID
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
  _id?: meteorID; //Mongo generated ID
  name: string;
  description: string;
  URI: string;
  range: meteorID;
}

