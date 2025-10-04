import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MessageService} from '../../shared/service/message.service';
import {Message} from '../../shared/model/message.model';
import {UserService} from '../../shared/service/user.service';
import {UserChat} from '../../shared/model/user';
import {ChatNotificationRealtimeService} from '../../shared/service/chat-notification-realtime.service';
import {AuthService} from '../../shared/service/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  users: UserChat[] = [];
  isLoadingUsers = false;

  selectedUser: UserChat | null = this.users[0];
  currentUser: UserChat = {id: 1};
  messageInput = '';
  isLoadingMessages = false;
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private messageSubscription: any;
  private wsConnected = false;

  constructor(private readonly messageService: MessageService,
              private readonly chatService: ChatNotificationRealtimeService,
              private readonly authService: AuthService,
              private readonly userService: UserService) {
  }

  _currentMessages: Message[] = [];

  get currentMessages(): Message[] {
    return this.isLoadingMessages ? [] : this._currentMessages;
  }

  ngOnInit() {
    this.isLoadingUsers = true;
    let userFromToken: any = this.authService.getAuthUserFromToken();
    this.currentUser = {
      id: userFromToken.id,
      name: userFromToken.username + " " + userFromToken.lastname,
      online: true
    };
    // Connect to WebSocket for real-time
    const token = localStorage.getItem('token') || '';
    this.chatService.connect(this.currentUser.id, token);
    // Listen for incoming messages
    this.messageSubscription = this.chatService.onMessageReceived((msg: Message) => {
      // Only push if the message is for the selected user
      if (
        this.selectedUser &&
        ((msg.sender.id === this.selectedUser.id && msg.recipient.id === this.currentUser.id) ||
         (msg.sender.id === this.currentUser.id && msg.recipient.id === this.selectedUser.id))
      ) {
        this._currentMessages.push(msg);
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
    this.userService.getChatUsers().subscribe({
      next: users => {
        this.users = users.filter(user => user.id !== this.currentUser.id);
        this.isLoadingUsers = false;
        if (users.length > 0) {
          this.selectUser(users[0]);
        }
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.messageSubscription && typeof this.messageSubscription.unsubscribe === 'function') {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  selectUser(user: UserChat) {
    this.selectedUser = user;
    this.isLoadingMessages = true;
    this.messageInput = '';
    // Appel de la méthode pour marquer les messages comme lus
    this.messageService.getMessagesBetweenUsers(this.selectedUser.id, this.currentUser.id).subscribe(
      {
        next: messages => {
          this._currentMessages = messages;
          this.isLoadingMessages = false;
          setTimeout(() => this.scrollToBottom(), 0);
        },
        error: () => {
          this.isLoadingMessages = false;
        }
      }
    );
    this.messageService.markMessagesAsRead(this.selectedUser.id, this.currentUser.id).subscribe();
  }

  sendMessage() {
    if (!this.messageInput.trim() || !this.selectedUser) return;
    this.chatService.sendMessage(this.selectedUser.id + "", this.messageInput);
    this.messageInput = '';
    // The message will be added in real-time by the onMessageReceived handler
  }

  scrollToBottom() {
    if (this.messagesEnd) {
      this.messagesEnd.nativeElement.scrollIntoView({behavior: 'smooth'});
    }
  }

  getUserInitials(name?: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  }
}
