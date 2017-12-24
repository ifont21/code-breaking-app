import { Authservice } from './../shared/services/auth.service';
import { BaseActionComponent } from './../shared/components/base-action/base-action.component';
import { RequestService } from './../shared/services/request.service';
import { AppSocketIOService } from './../shared/services/app-socket.io.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';


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

  private path = '/challenges';

  constructor(
    protected authService: Authservice,
    private socketService: AppSocketIOService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
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
        const challengerOne = res.body.challengerOne.player.username;
        const challengerTwo = res.body.challengerTwo.player.username;
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
    if (results.fames === 4) {
      // set winner message
      this.endGameMessage = 'You are the Winner';
      this.visible = true;
      this.socketService.emitLoser();
      return;
    }
    const attempt = {
      number: this.attemptsForm.controls['attemptNumber'].value,
      points: results.points,
      fames: results.fames
    };

    this.socketService.setAttempt(attempt);
    this.socketService.emitShowOpponentAttempts();

    this.myTurn = false;
    this.socketService.emitTurn();

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
