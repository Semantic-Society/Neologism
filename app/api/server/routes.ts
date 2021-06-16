
import { Meteor } from 'meteor/meteor';
import {JsonRoutes} from 'meteor/simple:json-routes';

import {Vocabularies, Users } from '../collections';

import {saveClassesWithPropertiesAsFile, getClassesWithProperties } from './helper';

import * as fs from 'fs';

// TODO (Johannes): Do we need this ?
JsonRoutes.add("get", "/vocabulary/:id", (req, res) => {
    try {
      const vocabId = req.params.id || null;
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

      const buffer = saveClassesWithPropertiesAsFile(getClassesWithProperties(vocabId), vocab, authorEmails);

      res.setHeader('Content-type', 'text/plain');

      res.end(buffer);

    } catch (error) {
      console.log(error);
      res.end('Internal Server Error');
      return;
    }
  });


  JsonRoutes.add('post', '/vocabulary/publish/:id', (req, res) => {
    try {
      const storageLocation = Meteor.settings.storageLocation;
      if (!storageLocation) {
        res.end('Config error');
        return;
      }
      const vocabId = req.params.id || null;
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
  
      const buffer = req.body.rdf
      const filePath=`${storageLocation}/${vocab.name}.ttl`
     let fd = fs.openSync(filePath, 'w');
      const encoding='utf8'
      fs.write(fd, buffer,0, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file.', err.message));
        } else {
          console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filePath);
        }
      });
      res.statusCode = 200;
      res.end('File uploaded');

    } catch (error) {
      console.log(error);
      res.end('Internal Server Error');
      return;
    }
  });



