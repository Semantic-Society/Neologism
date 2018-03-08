// Angular Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatInputModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatButtonModule,
        MatExpansionModule,
        MatListModule,
        MatCardModule } from "@angular/material";

// App Services
// import { RdfmodelService } from './services/rdfmodel.service';

// App Components
import { AppComponent } from './app.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { InfoboxComponent } from './infobox/infobox.component';


@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    InfoboxComponent
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule
  ],
  providers: [
    // RdfmodelService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
