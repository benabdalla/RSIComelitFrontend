import {UserProfil} from './user-profil.model';
import {Reaction} from './reaction.model';

export interface Comment {
  id: string;
  content: string;
  author: UserProfil;
  postId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  reactions: Reaction[];
  isLiked: boolean;
  replies: Comment[];
  repliesCount: number;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}
