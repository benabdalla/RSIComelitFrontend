import {UserSimple} from './user-simple';

export interface Notification {
  id: number;
  type: NotificationType;
  receiver: UserSimple;
  sender: UserSimple;
  isSeen: boolean;
  isRead: boolean;
  dateCreated: Date;
  dateUpdated: Date;
  dateLastModified: Date;
}

// notification-type.enum.ts

export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  UNLIKE = 'UNLIKE',
  SHARE = 'SHARE',
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
  MESSAGE = 'MESSAGE',
  MENTION = 'MENTION',
  TAG = 'TAG',
  NOT_JUSTIFIED_ABSENCE = 'NOT JUSTIFIED ABSENCE'
}
