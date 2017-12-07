import { Authservice } from './../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cbr-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit {

  public userLoggedIn: string;

  constructor(private authService: Authservice) { }

  ngOnInit() {
    this.authService.getUserAuthenticated().subscribe(user => this.userLoggedIn = user);
  }

}
