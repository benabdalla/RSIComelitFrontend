import {UserProfil} from './user-profil.model';
import {Reaction} from './reaction.model';

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  author: UserProfil;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reactions: Reaction[];
  isLiked: boolean;
  isBookmarked: boolean;
  visibility: PostVisibility;
  tags: string[];
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE'
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  visibility: PostVisibility;
  tags: string[];
}
