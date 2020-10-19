export interface IClassInfo {
    label: string, 
    description: string, 
    url: string
}

export interface IClassProperties {
    comment: string,
    label: string,
    uri: string,
    range: string,
    [key: string]: any
}

export interface IClassProperty {
    comment: string,
    label: string,
    uri: string,
    range: string
}