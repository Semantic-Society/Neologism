import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit {

  vocabularyName = 'My test vocabulary';
  vocabularyHref = '#Persistent link to the vocabulary';
  vocabularyLinkText = '';
  versionString = 'Version: 0.2';

  public collapsed = true;

  authors: string[] = ['Michael Cochez', 'Iraklis Dimitriadis'];

  constructor() { }

  ngOnInit() {
  }

}
