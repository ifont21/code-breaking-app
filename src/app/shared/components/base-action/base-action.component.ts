import { Authservice } from './../../services/auth.service';
import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'cbr-action-component',
    template: '<div>',
    styleUrls: []

})
export class BaseActionComponent {
    constructor(
        protected authService: Authservice
    ) { }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        this.authService.logout('username');
    }
}
