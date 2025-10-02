import {Injectable} from '@angular/core';

import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient!: Client;
  private userId!: number; // ton ID utilisateur courant

  private messageListeners: ((msg: any) => void)[] = [];

  connect(userId: number, token: string) {
    this.userId = userId;

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws/chat', // ton endpoint WebSocket Spring
      connectHeaders: {
        login: this.userId.toString(),
        Authorization: `Bearer ${token}`// peut contenir ton JWT ou userId
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat')
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      // 🔹 Abonnement aux messages privés
      this.stompClient.subscribe(`/user/${this.userId}/queue/messages`, (message: IMessage) => {
        const msgObj = JSON.parse(message.body);
        this.messageListeners.forEach(listener => listener(msgObj));
      });

      // 🔹 Abonnement à la liste des utilisateurs
      this.stompClient.subscribe(`/topic/users`, (users: IMessage) => {
        console.log('Liste utilisateurs mise à jour : ', JSON.parse(users.body));
      });
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
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('Déconnecté du serveur WebSocket');
    }
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
}
