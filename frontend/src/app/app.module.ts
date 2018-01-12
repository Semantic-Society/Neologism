// Angular Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// App Services
// import { RdfmodelService } from './services/rdfmodel.service';

// App Components
import { AppComponent } from './app.component';
import { MxgraphComponent } from './mxgraph/mxgraph.component';

@NgModule({
  declarations: [
    AppComponent,
    MxgraphComponent,
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatButtonModule,
  ],
  providers: [
    // RdfmodelService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
