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
export class DashboardComponent implements OnInit {

  public userOnlines: any;
  public challenges: any;
  public userLoggedIn: string;
  public msgs: Message[] = [];

  private path = '/challenges';

  constructor(private socketService: AppSocketIOService,
    private authService: Authservice,
    private confirmationService: ConfirmationService,
    private requestService: RequestService,
    private router: Router) { }

  ngOnInit() {
    this.socketService.getOnlineUsers();
    this.socketService.getChallenges();
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
            this.socketService.emitStartChallenge(res.body);
            this.router.navigate(['/game']);
          }, (error) => {
            this.msgs = [{ severity: 'error', summary: 'Error', detail: error }];
          });

      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.authService.logout('username');
  }
}
