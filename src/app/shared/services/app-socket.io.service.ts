import { Router } from '@angular/router';
import { Player } from './../models/player';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AppSocketIOService {

  private socket;

  public onlineUsersSubject: Subject<any> = new Subject<any>();
  public challengesSubject: Subject<any> = new Subject<any>();
  public challengeSubject: Subject<any> = new Subject<any>();

  public opponentNumber: Subject<string> = new Subject<string>();
  public numberOpp: string;

  public opponentReady: Subject<boolean> = new Subject<boolean>();

  public readyToPlay: Subject<boolean> = new Subject<boolean>();

  public myTurn: Subject<boolean> = new Subject<boolean>();

  public myNumber: number;

  public opponentUsername: string;
  public userLogged: string;

  public lost: Subject<boolean> = new Subject<boolean>();

  private attemptsSubject: Subject<any> = new Subject<any>();
  private attempts = [];

  private attemptsOpponentSubject: Subject<any> = new Subject<any>();
  private attemptsOpponent: any;


  constructor(
    private router: Router
  ) {
    this.socket = io();
    // this.socket = io('http://localhost:8080');
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

  emitInitialNumber(number: number, opponent: string) {
    this.socket.emit('setNumber', {
      opponent,
      number
    });
  }

  emitReadyToPlay() {
    this.socket.emit('readyToPlay', true);
  }

  emitTurn() {
    this.socket.emit('turn', {
      opponent: this.opponentUsername,
      turn: true
    });
  }

  emitLoser() {
    this.socket.emit('loser', this.opponentUsername);
  }

  emitShowOpponentAttempts() {
    const attemptObj = {
      opponent: this.opponentUsername,
      attempts: this.attempts
    };
    this.socket.emit('opponentAttempts', attemptObj);
  }

  /****************************************   Listen to Events *************************************************** */

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

  onStartGame() {
    const self = this;
    this.socket.on('loadChallenge', (challengeId) => {
      this.router.navigate(['/game', challengeId]);
    });
  }

  onSetOpponent() {
    const self = this;
    this.socket.on('setOpponentNumber', (data) => {
      if (data.opponent === this.opponentUsername) {
        self.numberOpp = data.number;
        self.opponentNumber.next(self.numberOpp);
      }
      self.opponentReady.next(true);
      if (self.myNumber && self.numberOpp) {
        this.readyToPlay.next(true);
        self.emitReadyToPlay();
        self.emitTurn();
      }
    });
  }

  loadGame() {
    this.socket.on('loadPlay', (readyToPlay) => {
      this.readyToPlay.next(readyToPlay);
    });
  }

  onSetTurn() {
    const self = this;
    this.socket.on('turnPlay', function (data) {
      if (data.opponent === self.userLogged) {
        self.myTurn.next(true);
      }
    });
  }

  onLoadLoserMessage() {
    const self = this;
    this.socket.on('showLoserMessage', function (data) {
      if (data === self.userLogged) {
        self.lost.next(true);
      }
    });
  }

  onLoadOpponentAttempts() {
    const self = this;
    this.socket.on('showAttempts', (data) => {
      if (data.opponent === self.userLogged) {
        this.attemptsOpponentSubject.next(data.attempts);
      }
    });
  }

  // *********************************************************************************************

  setAttempt(attempt: any) {
    this.attempts.push(attempt);
    this.attemptsSubject.next(this.attempts);
  }

  getAttempt() {
    return this.attemptsSubject;
  }

  getOpponentAttempts() {
    return this.attemptsOpponentSubject;
  }

}
