import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RdfmodelService } from './services/rdfmodel.service';


import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [RdfmodelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
