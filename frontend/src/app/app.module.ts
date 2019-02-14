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
import {NodeCreatorComponent} from './sidebar-editors/node-creator/node-creator.component'

// Pipes
import { TruncateModule } from '@yellowspot/ng-truncate';
import { TruncatedTextComponentComponent } from './truncated-text-component/truncated-text-component.component';
import { NeologismMaterialModule } from './app.material.module';
import { StateServiceModule } from './services/state-services/state.services.module';
import { EditboxService } from './editbox/editbox.service';
import { AccessManagement } from './services/access-management.service';
import { AddUserModalComponent } from './vocablist/components/add-user-modal/add-user-modal.component';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginAuthGuard } from './guards/login.auth.guard';
import { VocabularyListComponent } from './home-dashboard/vocabulary-list/vocabulary-list.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    HomeDashboardComponent,
    LoginPageComponent,
    VocabularyListComponent,
    MxgraphComponent,
    EditboxComponent,
    MetadataComponent,
    RecommenderComponent,
    StandardViewComponent,
    TruncatedTextComponentComponent,
    VocablistComponent,
    AddUserModalComponent,
    NodeCreatorComponent
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
    StateServiceModule,
    NgZorroAntdModule
  ],
  entryComponents: [
    AddUserModalComponent
  ],
  providers: [
    LoginAuthGuard,
    AuthGuard,
    RecommendationService,
    EditboxService,
    VocabulariesService,
    AccessManagement,
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
