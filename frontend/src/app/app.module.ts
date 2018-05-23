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
  MatSidenavModule, MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatIconModule,
} from '@angular/material';

// App Services
import { RecommendationService } from './services/recommendation.service';

// App Components
import { AppComponent } from './app.component';
import { EditboxComponent } from './editbox/editbox.component';
import { MetadataComponent } from './metadata/metadata.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { StandardViewComponent } from './mxgraph/standardView/standardView.component';
import { RecommenderComponent } from './recommender/recommender.component';
import { VocablistComponent } from './vocablist/vocablist.component';

// Pipes
import { TruncateModule } from '@yellowspot/ng-truncate';
import { TruncatedTextComponentComponent } from './truncated-text-component/truncated-text-component.component';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    EditboxComponent,
    MetadataComponent,
    RecommenderComponent,
    StandardViewComponent,
    TruncatedTextComponentComponent,
    VocablistComponent
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
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    TruncateModule,
    MatTableModule
  ],
  providers: [
    RecommendationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
