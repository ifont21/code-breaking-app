import { Player } from './../shared/models/player';
import { BaseActionComponent } from './../shared/components/base-action/base-action.component';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { RequestService } from './../shared/services/request.service';
import { ConfirmationService, Message } from 'primeng/primeng';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppSocketIOService } from '../shared/services/app-socket.io.service';
import { Authservice } from '../shared/services/auth.service';

@Component({
  selector: 'cbr-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseActionComponent implements OnInit {

  public userOnlines: any;
  public ranking: Player[];
  public challenges: any;
  public userLoggedIn: string;
  public msgs: Message[] = [];

  private path = '/challenges';

  constructor(private socketService: AppSocketIOService,
    protected authService: Authservice,
    private confirmationService: ConfirmationService,
    private requestService: RequestService,
    private router: Router) {
    super(authService);
  }

  ngOnInit() {
    this.getRanking();
    this.socketService.getOnlineUsers();
    this.socketService.getChallenges();
    this.socketService.onStartGame();
    this.socketService.onlineUsersSubject.subscribe(data => this.userOnlines = data);
    this.socketService.challengesSubject.subscribe(data => this.challenges = data);
    this.userLoggedIn = localStorage.getItem('username');
  }

  challengeOpponent(username: string) {
    this.confirmationService.confirm({
      message: `Do you want to challenge this to ${username}`,
      header: 'Confirmation',
      accept: () => {
        const challenge = {
          challenged: username,
          challenger: this.userLoggedIn
        };
        this.socketService.emitToChallengeOpponent(challenge);
        this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'Your challenge has been sent' }];
      }
    });
  }

  answerChallenge(username: string) {
    this.confirmationService.confirm({
      message: `Do you want to accept this challenge? `,
      header: 'Confirmation',
      accept: () => {
        const payload = {
          challengerOne: username,
          challengerTwo: this.userLoggedIn
        };
        this.requestService.post(this.path, payload)
          .subscribe((res: HttpResponse<any>) => {
            this.socketService.emitStartChallenge(res.body._id);
          }, (error) => {
            this.msgs = [{ severity: 'error', summary: 'Error', detail: error }];
          });

      }
    });
  }

  private getRanking() {
    this.requestService.get('/ranking')
      .subscribe((ranking: HttpResponse<Player[]>) => {
        this.ranking = ranking.body;
      }, (error) => {
        this.msgs = [{ severity: 'error', summary: 'Error', detail: error }];
      });
  }
}
