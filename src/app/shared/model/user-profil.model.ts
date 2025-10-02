export interface UserProfil {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  salaire: number;
  experience: string;
  dateDebutContrat: Date;
  site: string;
  processus: string;
  cin: string;
  gender: string;
  hoursOfWork: number;
  certification: string;
  yearsOfExperience: number;
}

export interface UserListResponse {
  users: UserProfil[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface UserProfile extends UserProfil {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}
