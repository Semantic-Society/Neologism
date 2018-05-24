import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { EditboxComponent } from './editbox/editbox.component';
import { MetadataComponent } from './metadata/metadata.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { StandardViewComponent } from './mxgraph/standardView/standardView.component';
import { RecommenderComponent } from './recommender/recommender.component';
import { VocablistComponent } from './vocablist/vocablist.component';

const routes: Routes = [
  { path: '', redirectTo: '/vocabularies', pathMatch: 'full' },
  { path: 'vocabularies', component: VocablistComponent },
  { path: 'v/:id', component: MxgraphComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule { }
