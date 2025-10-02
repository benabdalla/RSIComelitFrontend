import {UserProfil} from './user-profil.model';

export interface Reaction {
  id: string;
  type: ReactionType;
  user: UserProfil;
  targetId: string;
  targetType: ReactionTargetType;
  createdAt: Date;
}

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  LAUGH = 'LAUGH',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

export enum ReactionTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT'
}

export interface CreateReactionRequest {
  type: ReactionType;
  targetId: string;
  targetType: ReactionTargetType;
}
