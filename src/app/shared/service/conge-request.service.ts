import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CongeRequest, SaveCongeRequest} from '../model/conges';


@Injectable({
  providedIn: 'root'
})
export class CongeRequestService {
  private apiUrl = environment.apiUrl + '/conge-requests';

  constructor(private http: HttpClient) {
  }

  createDraft(dto: SaveCongeRequest): Observable<CongeRequest> {
    return this.http.post<CongeRequest>(`${this.apiUrl}/draft`, dto);
  }

  updateDraft(id: number, dto: SaveCongeRequest, requesterId: number): Observable<CongeRequest> {
    const params = new HttpParams().set('requesterId', requesterId);
    return this.http.put<CongeRequest>(`${this.apiUrl}/draft/${id}`, dto, {params});
  }

  sendRequest(id: number): Observable<CongeRequest> {
    return this.http.post<CongeRequest>(`${this.apiUrl}/send/${id}`, {});
  }

  validateRequest(id: number, validatorId: number, comment?: string): Observable<CongeRequest> {
    let params = new HttpParams().set('validatorId', validatorId);
    if (comment) params = params.set('comment', comment);
    return this.http.post<CongeRequest>(`${this.apiUrl}/validate/${id}`, {}, {params});
  }

  rejectRequest(id: number, validatorId: number, comment?: string): Observable<CongeRequest> {
    let params = new HttpParams().set('validatorId', validatorId);
    if (comment) params = params.set('comment', comment);
    return this.http.post<CongeRequest>(`${this.apiUrl}/reject/${id}`, {}, {params});
  }

  getMyRequests(requesterId: number): Observable<CongeRequest[]> {
    const params = new HttpParams().set('requesterId', requesterId);
    return this.http.get<CongeRequest[]>(`${this.apiUrl}/mine`, {params});
  }

  getRequestsToValidate(validatorId: number): Observable<CongeRequest[]> {
    const params = new HttpParams().set('validatorId', validatorId);
    return this.http.get<CongeRequest[]>(`${this.apiUrl}/to-validate`, {params});
  }
}

