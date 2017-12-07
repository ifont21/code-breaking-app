import { Player } from './../models/player';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AppSocketIOService {

  private socket;

  public onlineUsersSubject: Subject<any> = new Subject<any>();
  public challengesSubject: Subject<any> = new Subject<any>();

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

  emitToFetchChallenges() {
    this.socket.emit('fetchChallenges');
  }

  emitToChallengeOpponent(challenge: any) {
    this.socket.emit('challenger', challenge);
  }

  emitStartChallenge(challenge: any) {
    this.socket.emit('startChallenge', challenge);
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

  getChallenges() {
    const userLogged = localStorage.getItem('username');
    const self = this;
    this.socket.on('getChallenges', (data) => {
      const challenges = data.challenges;
      const arrayChallenges = challenges.filter(function (item) {
        return item.challenged === userLogged;
      });
      self.challengesSubject.next(arrayChallenges);
    });
  }

}
