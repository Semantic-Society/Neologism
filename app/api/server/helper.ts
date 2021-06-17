import { Meteor } from 'meteor/meteor';
import { Vocabularies, Users } from '../collections';

import * as fs from 'fs';

export function publishVocabulary(rdfTtl: String, vocabId) {
    try {
        const storageLocation = Meteor.settings.storageLocation;
        if (!storageLocation) {
            console.log('Config error');
            return;
        }
        let name = '';
        const vocab = Vocabularies.findOne({ _id: vocabId }) || null;
        if (!vocab) {
            throw new Meteor.Error(404, 'Not Found');
        }

        const authorEmails = vocab.authors.map((author) => {
            const emails = Users.findOne({ _id: author }).emails;
            if (!!emails)
                return emails;
        });

        if (name === '' || name === undefined) name = 'vocab-' + vocabId;

        const buffer = rdfTtl
        const filePath = `${storageLocation}/${vocab.name}.ttl`
        let fd = fs.openSync(filePath, 'w');
        const encoding = 'utf8'
        fs.write(fd, buffer, 0, encoding, function (err) {
            if (err) {
                throw (new Meteor.Error(500, 'Failed to save file.', err.message));
            } else {
                console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filePath);
            }
        });

    } catch (error) {
        console.log(error);
        return;
    }

}