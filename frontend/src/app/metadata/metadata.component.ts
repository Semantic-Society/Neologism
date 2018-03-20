import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit {

  vocabularyName = 'Vocabulary Name';
  vocabularyHref = '#';
  vocabularyLinkText = 'Persistent link to the vocabulary';
  versionString = 'Version: 0.0';

  authors: string[] = ['Author 1', 'Author 2', 'Author 3', 'Author 4', 'Author 5', 'Author 6', 'Author 7',];

  constructor() { }

  ngOnInit() {
  }

}
