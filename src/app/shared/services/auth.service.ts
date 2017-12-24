import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class Authservice {

  public userAuthenticated: Subject<string> = new Subject<string>();

  constructor() { }

  login(username: string) {
    this.userAuthenticated.next(username);
    localStorage.setItem('username', username);
  }

  logout(username: string) {
    this.userAuthenticated.next('');
    localStorage.removeItem('username');
  }

  getUserAuthenticated() {
    return this.userAuthenticated;
  }
}
