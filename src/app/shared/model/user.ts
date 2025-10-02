import {Country} from "./country";

export class User {
        id!: number;
        email!: string;
        firstName!: string;
        lastName!: string;
        gender!: string;
        intro!: string;
        hometown!: string;
        currentCity!: string;
        eduInstitution!: string;
        workplace!: string;
        country!: Country;
        profilePhoto!: string;
        coverPhoto!: string;
        role!: string;
        followerCount!: number;
        followingCount!: number;
        enabled!: boolean;
        accountVerified!: boolean;
        emailVerified!: boolean;
        birthDate!: string;
        joinDate!: string;
        dateLastModified!: string;

}

export interface UserChat {
  id: number;
  name?: string;
  avatar?: string;
  online?: boolean;
}

export interface JwtPayload {
  exp: number;
  iat: number;
  id: number;
  lastname: string;
  nom: string;
  role: string;
  sub: string;
  username: string;
  avatarUrl: string;
}
