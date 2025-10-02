import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PostResponse} from '../model/post-response';
import {UpdateUserEmail} from '../model/update-user-email';
import {UpdateUserInfo} from '../model/update-user-info';
import {UpdateUserPassword} from '../model/update-user-password';
import {User, UserChat} from '../model/user';
import {UserResponse} from '../model/user-response';
import {UserSimple} from '../model/user-simple';
import {PaginationParams, UserListResponse, UserProfil} from '../model/user-profil.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersApiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
  }

  getFollowedByAuthUserUserById(id: number): Observable<UserResponse | HttpErrorResponse> {
    return this.http.get<UserResponse | HttpErrorResponse>(`${this.usersApiUrl}/followed-by-auth-user/${id}`);
  }

  getById(id: number): Observable<UserResponse | HttpErrorResponse> {
    return this.http.get<UserResponse | HttpErrorResponse>(`${this.usersApiUrl}/${id}`);
  }

  getUserFollowingList(userId: number, page: number, size: number): Observable<UserResponse[] | HttpErrorResponse> {
    const reqParams = new HttpParams().set('page', page).set('size', size);
    return this.http.get<UserResponse[] | HttpErrorResponse>(`${this.usersApiUrl}/${userId}/following`, {
      params: reqParams,
    });
  }

  getUserFollowerList(userId: number, page: number, size: number): Observable<UserResponse[] | HttpErrorResponse> {
    const reqParams = new HttpParams().set('page', page).set('size', size);
    return this.http.get<UserResponse[] | HttpErrorResponse>(`${this.usersApiUrl}/${userId}/follower`, {
      params: reqParams,
    });
  }

  getUserPosts(userId: number, page: number, size: number): Observable<PostResponse[] | HttpErrorResponse> {
    const reqParams = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<PostResponse[] | HttpErrorResponse>(`${this.usersApiUrl}/${userId}/posts`, {
      params: reqParams,
    });
  }

  getAllPosts(page: number, size: number): Observable<PostResponse[] | HttpErrorResponse> {
    const reqParams = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<PostResponse[] | HttpErrorResponse>(`${this.usersApiUrl}/posts/me`, {
      params: reqParams,
    });
  }

  verifyEmail(token: string): Observable<HttpResponse<any> | HttpErrorResponse> {
    return this.http.post<HttpResponse<any> | HttpErrorResponse>(`${this.usersApiUrl}/verify-email/${token}`, null);
  }

  updateUserInfo(updateUserInfo: UpdateUserInfo): Observable<User | HttpErrorResponse> {
    return this.http.post<User | HttpErrorResponse>(`${this.usersApiUrl}/account/update/info`, updateUserInfo);
  }

  updateUserEmail(updateUserEmail: UpdateUserEmail): Observable<any | HttpErrorResponse> {
    return this.http.post<any | HttpErrorResponse>(`${this.usersApiUrl}/account/update/email`, updateUserEmail);
  }

  updateUserPassword(updateUserPassword: UpdateUserPassword): Observable<any | HttpErrorResponse> {
    return this.http.post<any | HttpErrorResponse>(`${this.usersApiUrl}/account/update/password`, updateUserPassword);
  }

  updateProfilePhoto(profilePhoto: File): Observable<User | HttpErrorResponse> {
    const formData = new FormData();
    formData.append('profilePhoto', profilePhoto);
    return this.http.post<User | HttpErrorResponse>(`${this.usersApiUrl}/account/update/profile-photo`, formData);
  }

  updateCoverPhoto(coverPhoto: File): Observable<User | HttpErrorResponse> {
    const formData = new FormData();
    formData.append('coverPhoto', coverPhoto);
    return this.http.post<User | HttpErrorResponse>(`${this.usersApiUrl}/account/update/cover-photo`, formData);
  }

  followUser(userId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any | HttpErrorResponse>(`${this.usersApiUrl}/account/follow/${userId}`, null);
  }

  unfollowUser(userId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any | HttpErrorResponse>(`${this.usersApiUrl}/account/unfollow/${userId}`, null);
  }

  getUserSearchResult(key: string, page: number, size: number): Observable<UserResponse[] | HttpErrorResponse> {
    const reqParams = new HttpParams().set('key', key).set('page', page).set('size', size);
    return this.http.get<UserResponse[] | HttpErrorResponse>(`${this.usersApiUrl}/search`, {
      params: reqParams,
    });
  }

  simpleUserSearch(query: string): Observable<UserSimple[]> {
    return this.http.get<UserSimple[]>(`${this.usersApiUrl}/simple-search`, {
      params: new HttpParams().set('query', query)
    });
  }

  addUser(user: UserProfil, avatar?: File): Observable<UserProfil> {

    const formData = new FormData();

    formData.append('user', new Blob([JSON.stringify(user)], {type: 'application/json'}));

    if (avatar) {
      formData.append('avatar', avatar);
    }

    return this.http.post<UserProfil>(this.usersApiUrl + "/add", formData);
  }

  updateUser(id: number, user: UserProfil): Observable<User> {
    return this.http.put<User>(`${this.usersApiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersApiUrl}/${id}`);
  }

  getUsers(params: PaginationParams): Observable<UserListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<UserListResponse>(`${this.usersApiUrl}/getAll`, {
      params: httpParams
    });
  }

  /**
   * Get the profile of the currently authenticated user
   */
  getProfile(): Observable<User | HttpErrorResponse> {
    return this.http.get<User | HttpErrorResponse>(`${this.usersApiUrl}/profile`);
  }

  /**
   * Delete the account of the currently authenticated user
   */
  deleteUserAccount(): Observable<any | HttpErrorResponse> {
    return this.http.post<any | HttpErrorResponse>(`${this.usersApiUrl}/account/delete`, null);
  }

  /**
   * Récupère la liste des utilisateurs pour le chat
   */
  getChatUsers(): Observable<UserChat[]> {
    return this.http.get<UserChat[]>(`${this.usersApiUrl}/chat`);
  }
}
