import {UserChat} from './user';

export interface Message {
  id?: number;
  recipient: UserChat;
  sender: UserChat;
  content: string;
  time: string;
  read?: boolean;
}
