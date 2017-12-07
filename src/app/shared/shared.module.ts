import { NgModule } from '@angular/core';
import { InputTextModule, ButtonModule, ConfirmDialogModule, ConfirmationService, GrowlModule } from 'primeng/primeng';

@NgModule({
  declarations: [],
  imports: [
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    GrowlModule
  ],
  exports: [
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    GrowlModule
  ],
  providers: [
    ConfirmationService
  ]
})
export class SharedModule { }
