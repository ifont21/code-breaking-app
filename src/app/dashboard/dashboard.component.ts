import { Component, OnInit } from '@angular/core';
import { AppSocketIOService } from '../shared/services/app-socket.io.service';

@Component({
  selector: 'cbr-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public userOnlines: any;

  constructor(private socketService: AppSocketIOService) { }

  ngOnInit() {
    this.socketService.onlineUsersSubject.subscribe(data => this.userOnlines = data);
  }

}
