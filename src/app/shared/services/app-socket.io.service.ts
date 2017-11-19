import { Player } from './../models/player';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AppSocketIOService {

  private socket;

  public onlineUsersSubject: Subject<any> = new Subject<any>();

  constructor() {
    this.socket = io('http://localhost:8080');
  }

  onSocketConnection() {
    this.socket.on('connect', () => {
      console.log('connected to server!');
    });
  }

  emitToFetchOnlineUsers(data: Player) {
    this.socket.emit('online', { username: data.username });
  }

  getOnlineUsers() {
    const userLogged = localStorage.getItem('username');
    const self = this;
    this.socket.on('getOnlines', (data) => {
      const session = data.session;
      const arraySession = session.filter(function (item) {
        return item.user !== userLogged;
      });
      self.onlineUsersSubject.next(arraySession);
    });
  }

}
