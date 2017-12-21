// Angular Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Angular Material
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from '@angular/material/button';

// App Services
import { RdfmodelService } from './services/rdfmodel.service';

// App Components
import { AppComponent } from './app.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';


@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatButtonModule
  ],
  providers: [RdfmodelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
