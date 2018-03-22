// Angular Core
import { NgModule, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatTooltipModule,
} from '@angular/material';

// App Services
import { RecommendationService } from './services/recommendation.service';
import { StateService } from './services/state.service';

// App Components
import { AppComponent } from './app.component';
import { InfoboxComponent } from './infobox/infobox.component';
import { MetadataComponent } from './metadata/metadata.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { RecommenderComponent } from './recommender/recommender.component';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    InfoboxComponent,
    MetadataComponent,
    RecommenderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
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
    StateService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
