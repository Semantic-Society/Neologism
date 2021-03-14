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
import {SideBarNodeCreatorComponent} from './core/node-creator.component'
// Pipes
import { TruncateModule } from '@yellowspot/ng-truncate';
import { TruncatedTextComponentComponent } from './truncated-text-component/truncated-text-component.component';
import { NeologismMaterialModule } from './app.material.module';
import { StateServiceModule } from './services/state-services/state.services.module';
import { EditboxService } from './editbox/editbox.service';
import { AccessManagement } from './services/access-management.service';
import { AddUserModalComponent } from './vocablist/components/add-user-modal/add-user-modal.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { registerLocaleData } from '@angular/common';
// import { NgParticlesModule } from 'ng-particles';

import en from '@angular/common/locales/en';

import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginAuthGuard } from './guards/login.auth.guard';
import { VocabularyListComponent } from './home-dashboard/vocabulary-list/vocabulary-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CreateVocabModalComponent } from './home-dashboard/create-vocab-modal/create-vocab-modal.component';
import { SearchVocabulariesAutocompleteComponent } from './search-vocabularies-autocomplete/search-vocabularies-autocomplete.component';
import { VocabularyEditorComponent } from './vocabulary-editor/vocabulary-editor.component';
import { MxGraphEditorComponent } from './vocabulary-editor/mx-graph-editor/mx-graph-editor.component';
import { VocabularyEditorService } from './vocabulary-editor/vocabulary-editor.service';
import { ListEditorComponent } from './vocabulary-editor/list-editor/list-editor.component';
import { EditComponentService } from './vocabulary-editor/edit.component.service';
import { RemoveUserModalComponent } from './vocablist/components/remove-user-modal/remove-user-modal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyEditModal } from './mxgraph/property-model/property-edit.component';
import {DupURIValidator } from './shared/DupURIValidator'
import { BatchRecommenderComponent } from './batchRecommender/batchRecommender.component';
import { SpellCheckerModule } from 'ngx-spellchecker';
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
    BatchRecommenderComponent,
    TruncatedTextComponentComponent,
    VocablistComponent,
    AddUserModalComponent,
    SideBarNodeCreatorComponent,
    CreateVocabModalComponent,
    VocabularyEditorComponent,
    SearchVocabulariesAutocompleteComponent,
    MxGraphEditorComponent,
    ListEditorComponent,
    RemoveUserModalComponent,
    PropertyEditModal,
    DupURIValidator
  ],
  imports: [
    AccountsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // NgParticlesModule,
    NeologismMaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    SpellCheckerModule,
    RoutingModule,
    TruncateModule,
    StateServiceModule,
    NgZorroAntdModule,
    NzButtonModule,
    MatSnackBarModule,
  ],
  entryComponents: [
    AddUserModalComponent,
    CreateVocabModalComponent,
    RemoveUserModalComponent,
    PropertyEditModal
  ],
  providers: [
    LoginAuthGuard,
    AuthGuard,
    RecommendationService,
    EditboxService,
    EditComponentService,
    VocabulariesService,
    VocabularyEditorService,
    AccessManagement,
    NzDrawerService,
    { provide: NZ_I18N, useValue: en_US },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
