
import { Meteor } from 'meteor/meteor'
import {JsonRoutes} from 'meteor/simple:json-routes'

import {Vocabularies, Users } from '../collections';

import {saveClassesWithPropertiesAsFile, getClassesWithProperties } from './helper';
var fs = require('fs')

JsonRoutes.add("get", "/vocabulary/:id", (req, res) => {
    try {
      const vocabId = req.params.id || null
      let name = ""
  
      const vocab = Vocabularies.findOne({ _id: vocabId }) || null
      if (!vocab) {
        throw new Meteor.Error(404, 'Not Found')
      }
  
      const authorEmails = vocab.authors.map((author) => {
        const emails = Users.findOne({ _id: author }).emails;
        if (!!emails)
          return emails
      })
  
      if (name === '' || name === undefined) name = 'vocab-' + vocabId;
  
      const buffer = saveClassesWithPropertiesAsFile(getClassesWithProperties(vocabId), vocab, authorEmails);
  
      res.setHeader('Content-type', 'text/plain');
  
      res.end(buffer)
  
    } catch (error) {
      console.log(error)
      res.end('Internal Server Error')
      return;
    }
  });


  JsonRoutes.add("post", "/vocabulary/publish/:id", (req, res) => {
    try {
      const storageLocation="";
      const vocabId = req.params.id || null
      let name = ""
  
      const vocab = Vocabularies.findOne({ _id: vocabId }) || null
      if (!vocab) {
        throw new Meteor.Error(404, 'Not Found')
      }
  
      const authorEmails = vocab.authors.map((author) => {
        const emails = Users.findOne({ _id: author }).emails;
        if (!!emails)
          return emails
      })
  
      if (name === '' || name === undefined) name = 'vocab-' + vocabId;
  
      const buffer = saveClassesWithPropertiesAsFile(getClassesWithProperties(vocabId), vocab, authorEmails);
      const modifiedDate =Date.now()
      const filePath=`${storageLocation}/${vocabId}_${modifiedDate}`
      const blob = new Blob([buffer], { type: 'text/plain' });
      const encoding='utf8'
      fs.writeFile(filePath, blob, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file.', err));
        } else {
          console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filePath);
        }
      }); 
        
      res.send(200)
  
    } catch (error) {
      console.log(error)
      res.end('Internal Server Error')
      return;
    }
  });
  

  
  