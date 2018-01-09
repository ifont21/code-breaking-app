import { Message } from 'primeng/primeng';
import { HttpResponse } from '@angular/common/http';
import { Challenger } from './../shared/models/challenger';
import { Authservice } from './../shared/services/auth.service';
import { BaseActionComponent } from './../shared/components/base-action/base-action.component';
import { RequestService } from './../shared/services/request.service';
import { AppSocketIOService } from './../shared/services/app-socket.io.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import { Challenge } from '../shared/models/challenge';


@Component({
  selector: 'cbr-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent extends BaseActionComponent implements OnInit {

  public challenge: any;

  public numberSet = false;
  public opponentReady = false;
  public myTurn = false;

  public readyToPlay = false;

  public opponentNumber: string;
  public myNumber: string;

  public numberForm: FormGroup;
  public attemptsForm: FormGroup;

  public myAttempts: any;
  public opponentAttempts: any;

  public userLoggedIn: string;
  public opponent: string;

  public endGameMessage: string;
  public visible = false;

  private challengers: any;

  public msgs: Message[] = [];

  private path = '/challenges';

  constructor(
    protected authService: Authservice,
    private socketService: AppSocketIOService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private request: RequestService
  ) {
    super(authService);
  }

  ngOnInit() {

    this.socketService.opponentReady.subscribe(ready => this.opponentReady = ready);
    this.socketService.opponentNumber.subscribe(number => this.opponentNumber = number);
    this.socketService.readyToPlay.subscribe(ready => this.readyToPlay = ready);
    this.socketService.myTurn.subscribe(turn => this.myTurn = turn);
    this.socketService.getAttempt().subscribe(attempts => this.myAttempts = attempts);
    this.socketService.getOpponentAttempts().subscribe(data => this.opponentAttempts = data);
    this.socketService.lost.subscribe(lost => {
      if (lost) {
        this.endGameMessage = 'Oh you have lost my friend. ¡Try it Again!';
        this.visible = true;
      }
    });

    this.userLoggedIn = localStorage.getItem('username');
    this.socketService.userLogged = this.userLoggedIn;

    this.route.params
      .filter((params: Params) => params['id'])
      .switchMap((params: Params) => this.request.get(`${this.path}/${params['id']}`))
      .subscribe((res: any) => {
        this.socketService.challengeId = res.body._id;
        const challengerOne = res.body.challengerOne.player.username;
        const challengerTwo = res.body.challengerTwo.player.username;
        this.challengers = { challengerOne, challengerTwo };
        this.opponent = challengerOne === this.userLoggedIn ? challengerTwo : challengerOne;
        this.socketService.opponentUsername = this.opponent;
      });

    this.numberForm = this.fb.group({
      number: ['', [Validators.required, Validators.maxLength(4), Validators.minLength(4)]]
    });

    this.attemptsForm = this.fb.group({
      attemptNumber: ['', [Validators.required, Validators.maxLength(4), Validators.minLength(4)]]
    });

    this.socketService.onSetOpponent();
    this.socketService.loadGame();
    this.socketService.onSetTurn();
    this.socketService.onLoadLoserMessage();
    this.socketService.onLoadOpponentAttempts();
  }

  setInitialNumber() {
    this.socketService.myNumber = this.numberForm.controls['number'].value;
    this.myNumber = this.numberForm.controls['number'].value;
    this.socketService.emitInitialNumber(this.numberForm.controls['number'].value, this.userLoggedIn);
    this.numberSet = true;
  }

  setAttempt() {
    const results = this.getPointsAndFames(this.socketService.numberOpp, this.attemptsForm.controls['attemptNumber'].value);

    const attempt = {
      number: this.attemptsForm.controls['attemptNumber'].value,
      points: results.points,
      fames: results.fames
    };

    this.socketService.setAttempt(attempt);
    this.socketService.emitShowOpponentAttempts();

    if (results.fames === 4) {
      const challenge = new Challenge();
      if (this.challengers.challengerOne === this.userLoggedIn) {
        const challengerOne = new Challenger();
        challengerOne.number = this.socketService.myNumber;
        challengerOne.winner = true;
        challengerOne.attempts = this.myAttempts.length;

        const challengerTwo = new Challenger();
        challengerTwo.number = this.socketService.numberOpp;
        challengerTwo.winner = false;

        challenge.challengerOne = challengerOne;
        challenge.challengerTwo = challengerTwo;

      } else {
        const challengerTwo = new Challenger();
        challengerTwo.number = this.socketService.myNumber;
        challengerTwo.winner = true;
        challengerTwo.attempts = this.myAttempts.length;

        const challengerOne = new Challenger();
        challengerOne.number = this.socketService.numberOpp;
        challengerOne.winner = false;

        challenge.challengerOne = challengerOne;
        challenge.challengerTwo = challengerTwo;
      }

      this.request.put(`/challenges/${this.socketService.challengeId}`, challenge)
        .subscribe((response: HttpResponse<any>) => {
          let keyWinner = '';
          let keyLost = '';
          if (response.body.challenge.challengerOne.winner) {
            keyWinner = 'challengerOne';
            keyLost = 'challengerTwo';
          } else {
            keyWinner = 'challengerTwo';
            keyLost = 'challengerOne';
          }

          this.request.patch(`/players/${response.body.challenge[keyWinner].player}`, { winner: true })
            .subscribe((player: HttpResponse<any>) => {
              if (player.body) {
                this.endGameMessage = 'You are the Winner';
                this.visible = true;
              }
            });
          this.request.patch(`/players/${response.body.challenge[keyLost].player}`, { winner: false })
            .subscribe((player: HttpResponse<any>) => {
              if (player.body) {
                this.socketService.emitLoser();
              }
            });
        }, (error) => {
          this.msgs = [{ severity: 'error', summary: 'Error', detail: error }];
        });
      return;
    }

    this.myTurn = false;
    this.socketService.emitTurn();

  }

  continue() {
    this.socketService.emitToFetchOnlineUsers({ username: this.userLoggedIn }, true);
    this.router.navigate(['/dashboard']);
  }

  private getPointsAndFames(number, attempt) {
    let countPoints = 0;
    let countFames = 0;
    if (number.length === 4 && attempt.length === 4) {
      number.split('').forEach((element, index) => {
        attempt.split('').forEach((elAttempt, iAttempt) => {
          if (element === elAttempt) {
            if (index === iAttempt) {
              countFames++;
            } else {
              countPoints++;
            }
          }
        });
      });
    }
    return {
      points: countPoints,
      fames: countFames
    };
  }

}
