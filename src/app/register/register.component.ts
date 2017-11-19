import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../shared/services/request.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Player } from '../shared/models/player';
import { AppSocketIOService } from '../shared/services/app-socket.io.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cbr-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  private path = '/players';
  public form: FormGroup;

  constructor(private request: RequestService,
    private fb: FormBuilder,
    private socketService: AppSocketIOService,
    private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.socketService.onSocketConnection();
  }

  public onSubmit() {
    if (this.form.valid) {
      const username = this.form.controls['username'].value;
      this.request.post(this.path, { username })
        .subscribe((res: HttpResponse<Player>) => {
          localStorage.setItem('username', res.body.username);
          this.socketService.emitToFetchOnlineUsers(res.body);
          this.socketService.getOnlineUsers();
          this.router.navigate(['/dashboard']);
          console.log('response', res.body);
        }, (error) => {
          console.log('error', error);
        });
    }
  }

}
