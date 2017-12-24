import { NgModule } from '@angular/core';
import { InputTextModule, ButtonModule, ConfirmDialogModule, ConfirmationService, GrowlModule, DialogModule } from 'primeng/primeng';

@NgModule({
  declarations: [],
  imports: [
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    GrowlModule,
    DialogModule
  ],
  exports: [
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    GrowlModule,
    DialogModule
  ],
  providers: [
    ConfirmationService
  ]
})
export class SharedModule { }
