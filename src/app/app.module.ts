import { AuthGuard } from './shared/auth-guard';
import { Authservice } from './shared/services/auth.service';
import { RequestService } from './shared/services/request.service';
import { CodeBreakingRouting } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { CoreComponent } from './core/core.component';
import { GameComponent } from './game/game.component';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppSocketIOService } from './shared/services/app-socket.io.service';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    CoreComponent,
    GameComponent,
    RegisterComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CodeBreakingRouting,
    SharedModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [
    RequestService,
    AppSocketIOService,
    Authservice,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
