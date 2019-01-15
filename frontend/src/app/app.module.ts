// Angular Core
import { HttpClientModule } from '@angular/common/http';
import { NgModule, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AccountsModule } from './angular2-material-meteor-accounts-ui/accounts-module';

import { RoutingModule } from './routing.module';

// App Services
import { RecommendationService } from './services/recommendation.service';
import { VocabulariesService } from './services/vocabularies.service';

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
import { NeologismMaterialModule } from './app.material.module';
import { StateServiceModule } from './services/state-services/state.services.module';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    EditboxComponent,
    MetadataComponent,
    RecommenderComponent,
    StandardViewComponent,
    TruncatedTextComponentComponent,
    VocablistComponent,
  ],
  imports: [
    AccountsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NeologismMaterialModule,
    BrowserAnimationsModule,
    RoutingModule,
    TruncateModule,
    StateServiceModule
  ],
  providers: [
    RecommendationService,
    VocabulariesService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
