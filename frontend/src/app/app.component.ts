import { Component } from '@angular/core';
import { RdfmodelService } from './services/rdfmodel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private s: RdfmodelService) {

  }

  title = 'app';
}
