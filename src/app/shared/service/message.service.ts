import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Message} from '../model/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private usersApiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {
  }

  getMessagesBetweenUsers(senderId: number, recipientId: number): Observable<Message[]> {
    const url = `${this.usersApiUrl}/${senderId}/${recipientId}`;
    return this.http.get<Message[]>(url);
  }

  markMessagesAsRead(senderId: number, recipientId: number): Observable<void> {
    const url = `${this.usersApiUrl}/read?senderId=${senderId}&recipientId=${recipientId}`;
    return this.http.patch<void>(url, {});
  }
}
