import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConfigHost } from '../../../config/configHost';

@Injectable()
export class RequestService {


  constructor(private http: HttpClient) { }

  public get(path: string): Observable<any> {
    return this.http.get(`${ConfigHost.host}${path}`, { observe: 'response' });
  }

  public post(path: string, payload: any): Observable<any> {
    return this.http.post(`${ConfigHost.host}${path}`, payload, { observe: 'response' });
  }

  public put(path: string, payload: any): Observable<any> {
    return this.http.put(`${ConfigHost.host}${path}`, payload, { observe: 'response' });
  }

  public patch(path: string, payload: any): Observable<any> {
    return this.http.patch(`${ConfigHost.host}${path}`, payload, { observe: 'response' });
  }

}
