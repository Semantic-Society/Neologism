import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { VocablistComponent } from './vocablist/vocablist.component';
import { ListEditorComponent } from './vocabulary-editor/list-editor/list-editor.component';
import { MxGraphEditorComponent } from './vocabulary-editor/mx-graph-editor/mx-graph-editor.component';
import { VocabularyEditorComponent } from './vocabulary-editor/vocabulary-editor.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'dashboard', component: HomeDashboardComponent, canActivate: [AuthGuard] },
    { path: 'v/:id',
        component: VocabularyEditorComponent,
        children: [
            {
                path: '',
                redirectTo: 'mxgraph',
                pathMatch: 'full'
            },
            {
                path: 'mxgraph',
                component: MxGraphEditorComponent
            },
            {
                path: 'list',
                component: ListEditorComponent
            }
        ]
    },
    { path: 'login', component: LoginPageComponent},
    { path: 'vocabularies', component: VocablistComponent },
    { path: 'edit/:id', component: MxgraphComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class RoutingModule { }
