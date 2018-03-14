// Angular Core
import { NgModule, } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        MatTooltipModule} from '@angular/material';

// App Services
import { RecommendationService } from './services/recommendation.service';

// App Components
import { AppComponent } from './app.component';
import { InfoboxComponent } from './infobox/infobox.component';
import { MetadataComponent } from './metadata/metadata.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    InfoboxComponent,
    MetadataComponent,
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
    MatTooltipModule,

  ],
  providers: [
    RecommendationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
