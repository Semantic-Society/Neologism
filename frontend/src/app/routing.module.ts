import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { EditboxComponent } from './editbox/editbox.component';
import { MetadataComponent } from './metadata/metadata.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { StandardViewComponent } from './mxgraph/standardView/standardView.component';
import { RecommenderComponent } from './recommender/recommender.component';
import { VocablistComponent } from './vocablist/vocablist.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginAuthGuard } from './guards/login.auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: HomeDashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [LoginAuthGuard] },
  { path: 'vocabularies', component: VocablistComponent },
  { path: 'v/:id', component: MxgraphComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule { }
