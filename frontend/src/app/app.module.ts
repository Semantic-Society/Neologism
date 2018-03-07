// Angular Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';

// App Services
// import { RdfmodelService } from './services/rdfmodel.service';

// App Components
import { AppComponent } from './app.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';
import { InfoboxComponent } from './infobox/infobox.component';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
    InfoboxComponent
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatCardModule
  ],
  providers: [
    // RdfmodelService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
