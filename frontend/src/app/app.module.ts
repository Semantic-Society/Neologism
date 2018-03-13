// Angular Core
import { NgModule, } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatInputModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatButtonModule,
        MatExpansionModule,
        MatListModule,
        MatCardModule,
        MatGridListModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatTooltipModule} from "@angular/material";

// App Services
// import { RdfmodelService } from './services/rdfmodel.service';

// App Components
import { AppComponent } from './app.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { InfoboxComponent } from './infobox/infobox.component';
import { MetadataComponent } from './metadata/metadata.component';


@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    InfoboxComponent,
    MetadataComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule

  ],
  providers: [
    // RdfmodelService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
