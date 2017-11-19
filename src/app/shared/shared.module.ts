import { NgModule } from '@angular/core';
import { InputTextModule, ButtonModule } from 'primeng/primeng';

@NgModule({
  declarations: [],
  imports: [
    InputTextModule,
    ButtonModule
  ],
  exports: [
    InputTextModule,
    ButtonModule
  ],
  providers: []
})
export class SharedModule { }
