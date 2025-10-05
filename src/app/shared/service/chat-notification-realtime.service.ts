import {Injectable} from '@angular/core';

import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable} from 'rxjs';
import {Notification, NotificationType} from '../model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ChatNotificationRealtimeService {
  private stompClient!: Client;
  private userId!: number; // ton ID utilisateur courant
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private notificationCountSubject = new BehaviorSubject<number>(0);
  private notificationMessageSubject = new BehaviorSubject<number>(0);
  private messageListeners: ((msg: any) => void)[] = [];
  private subscriptions: StompSubscription[] = [];

  connect(userId: number, token: string) {
    this.userId = userId;

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws/chat', // ton endpoint WebSocket Spring
      connectHeaders: {
        login: this.userId.toString(),
        Authorization: `Bearer ${token}`// peut contenir ton JWT ou userId
      },
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat')
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.subscribeChatMessages();
      this.subscribeConnectedUser();
      this.subscribeToNotifications();
    };
    this.stompClient.activate();
  }

  // Permet d'écouter les messages reçus en temps réel
  public onMessageReceived(listener: (msg: any) => void): { unsubscribe: () => void } {
    this.messageListeners.push(listener);
    return {
      unsubscribe: () => {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
      }
    };
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    this.connectionStatusSubject.next(false);
  }

  sendMessage(recipientId: string, text: string) {
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        sender: {id: this.userId},
        recipient: {id: +recipientId},
        content: text
      };
      this.stompClient.publish({destination: '/app/chat.sendMessage', body: JSON.stringify(message)});
    }
  }

  public getCurrentNotificationCount(): Observable<number> {
    return this.notificationCountSubject.asObservable();
  }

  public getCurrentMessageCount(): Observable<number> {
    return this.notificationMessageSubject.asObservable();
  }

  public initCurrentNotificationCount(): void {
    this.notificationCountSubject.next(0);
  }

  public setCurrentNotificationCount(value: number): void {
    this.notificationCountSubject.next(value);
  }

  public initCurrentMessageCount(): void {
    this.notificationMessageSubject.next(0);
  }

  public isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  private subscribeChatMessages() {
    // 🔹 Abonnement aux messages privés
    const sub = this.stompClient.subscribe(`/user/${this.userId}/queue/messages`, (message: IMessage) => {
      const msgObj = JSON.parse(message.body);
      this.messageListeners.forEach(listener => listener(msgObj));
    });
    this.subscriptions.push(sub);
  }

  private subscribeConnectedUser() {
    // 🔹 Abonnement à la liste des utilisateurs
    const sub = this.stompClient.subscribe(`/topic/users`, (users: IMessage) => {
      console.log('Liste utilisateurs mise à jour : ', JSON.parse(users.body));
    });
    this.subscriptions.push(sub);
  }

  private subscribeToNotifications() {
    const sub = this.stompClient.subscribe(
      `/user/${this.userId}/queue/notifications/count`,
      (message) => {
        try {
          const notificationData: Notification = JSON.parse(message.body);
          if (notificationData.type === NotificationType.MESSAGE) {
            this.notificationMessageSubject.next(this.notificationMessageSubject.getValue() + 1);
          } else {
            this.notificationCountSubject.next(this.notificationCountSubject.getValue() + 1);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message de notification:', error);
        }
      }
    );
    this.subscriptions.push(sub);
  }
}
