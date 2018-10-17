import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


import { Iclass, Iproperty, Iuser, Ivocabulary, meteorID } from 'models';
import { Classes, Properties, Users, Vocabularies } from '../collections';

Meteor.publish('vocabularies', function (): Mongo.Cursor<Ivocabulary> {
    // if (!this.userId) {
    //     return;
    // }

    return Vocabularies.collection.find({ $or: [{ authors: this.userId }, { public: true }] });
});

(Meteor as any).publishComposite('vocabDetails', function (vocabularyID: meteorID): PublishCompositeConfig<Ivocabulary> {
    if (!this.userId) {
        return this.ready();
    }

    return {
        // Must return a cursor containing top level documents
        find: () => {
            console.log("Received vocabDetails req. for id", vocabularyID)
            return Vocabularies.collection.find({ _id: vocabularyID,  $or: [{ authors: this.userId }, { public: true }] }, { limit: 1 });
        },

        children: [
            // Get author details
            {
                find: (vocab) => {
                    return Users.collection.find(
                        { _id: { $in: vocab.authors } },
                        { fields: { profile: 1 } }
                    );
                }
            } as PublishCompositeConfig1<Ivocabulary, Iuser>,

            // Get classes
            {
                find: (vocab) => {
                    // Called for each top level document. Top level document is passed
                    // in as an argument.
                    // Must return a cursor of second tier documents.
                    return Classes.collection.find({ _id: { $in: vocab.classes } });
                },
                children: [
                    // Get class properties
                    {
                        find: (c, vocab) => {
                            return Properties.collection.find({ _id: { $in: c.properties } });
                        }
                    } as PublishCompositeConfig2<Ivocabulary, Iclass, Iproperty>,
                ]
            } as PublishCompositeConfig1<Ivocabulary, Iclass>,
        ]
    };
});


interface PublishCompositeConfigN {
    collectionName?: string;
    children?: PublishCompositeConfigN[];
    find(
        ...args: any[]
    ): Mongo.Cursor<any>;
}

interface PublishCompositeConfig4<InLevel1, InLevel2, InLevel3, InLevel4, OutLevel> {
    collectionName?: string;
    children?: PublishCompositeConfigN[];
    find(
        arg4: InLevel4,
        arg3: InLevel3,
        arg2: InLevel2,
        arg1: InLevel1
    ): Mongo.Cursor<OutLevel>;
}

interface PublishCompositeConfig3<InLevel1, InLevel2, InLevel3, OutLevel> {
    collectionName?: string;
    children?: PublishCompositeConfig4<InLevel1, InLevel2, InLevel3, OutLevel, any>[];
    find(
        arg3: InLevel3,
        arg2: InLevel2,
        arg1: InLevel1
    ): Mongo.Cursor<OutLevel>;
}

interface PublishCompositeConfig2<InLevel1, InLevel2, OutLevel> {
    collectionName?: string;
    children?: PublishCompositeConfig3<InLevel1, InLevel2, OutLevel, any>[];
    find(
        arg2: InLevel2,
        arg1: InLevel1
    ): Mongo.Cursor<OutLevel>;
}

interface PublishCompositeConfig1<InLevel1, OutLevel> {
    collectionName?: string;
    children?: PublishCompositeConfig2<InLevel1, OutLevel, any>[];
    find(
        arg1: InLevel1
    ): Mongo.Cursor<OutLevel>;
}

interface PublishCompositeConfig<OutLevel> {
    collectionName?: string;
    children?: PublishCompositeConfig1<OutLevel, any>[];
    find(): Mongo.Cursor<OutLevel>;
}