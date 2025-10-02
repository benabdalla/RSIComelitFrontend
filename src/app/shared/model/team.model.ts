import {UserProfil} from './user-profil.model';

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  coverImage?: string;
  isPrivate: boolean;
  createdBy: UserProfil;
  createdAt: Date;
  updatedAt: Date;
  membersCount: number;
  members: TeamMember[];
  isMember: boolean;
  isAdmin: boolean;
}

export interface TeamMember {
  id: string;
  user: UserProfil;
  team: Team;
  role: TeamRole;
  joinedAt: Date;
}

export enum TeamRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface JoinTeamRequest {
  teamId: string;
}
