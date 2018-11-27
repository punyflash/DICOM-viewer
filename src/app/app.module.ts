import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ViewerComponent } from './viewer/viewer.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  declarations: [
    ViewerComponent,
    ToolbarComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [ViewerComponent, ToolbarComponent]
})
export class AppModule { }
