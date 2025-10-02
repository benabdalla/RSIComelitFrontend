import {HttpClient, HttpErrorResponse, HttpHeaders,} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PostComponent} from '../post/post.component';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {PostResponse} from '../../shared/model/post-response';
import {User} from '../../shared/model/user';
import {AuthService} from '../../shared/service/auth.service';
import {UserService} from '../../shared/service/user.service';
import {environment} from '../../../environments/environment';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {
  FollowingFollowerListDialogComponent
} from '../following-follower-list-dialog/following-follower-list-dialog.component';
import {PhotoUploadDialogComponent} from '../photo-upload-dialog/photo-upload-dialog.component';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {ViewPhotoDialogComponent} from '../view-photo-dialog/view-photo-dialog.component';
import {ChatBotComponent} from '../../chat-bot/chat-bot.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    RouterModule,
    // Dialog/snackbar components are opened dynamically via MatDialog; they don't need to be listed
    // in the host component's `imports` unless used directly in the template.
    PostComponent,ChatBotComponent
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  authUser!: User;
  profileUserId!: number;
  profileUser: User = (() => {
    const u = new User();
    u.firstName = '';
    u.lastName = '';
    u.intro = '';
    u.profilePhoto = environment.defaultProfilePhotoUrl;
    u.coverPhoto = environment.defaultCoverPhotoUrl;
    u.followerCount = 0;
    u.followingCount = 0;
    // minimal country placeholder to avoid template property access errors
    (u as any).country = { name: '' };
    return u;
  })();

  // Fallback images to display immediately when opening the component
  defaultProfilePhotoUrl: string = environment.defaultProfilePhotoUrl;
  defaultCoverPhotoUrl: string = environment.defaultCoverPhotoUrl;
  profileUserPostResponses: PostResponse[] = [];
  isProfileViewerOwner: boolean = false;
  viewerFollowsProfileUser: boolean = false;
  resultPage: number = 1;
  resultSize: number = 5;
  hasMoreResult: boolean = true;
  fetchingResult: boolean = false;
  loadingProfile: boolean = false;
  hasNoPost: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private matSnackbar: MatSnackBar
  ) {}

  /**
   * Fetch an image URL using HttpClient (with Authorization header if token exists)
   * and convert it into a blob object URL that <img> can load without needing headers.
   */
  private fetchImageToObjectUrl(url: string, assignTo: 'profile' | 'cover') {
    if (!url) return;
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    this.http
      .get(url, { responseType: 'blob', headers: headers as any })
      .subscribe({
        next: (blob) => {
          try {
            const objUrl = URL.createObjectURL(blob);
            if (assignTo === 'profile') {
              this.profileUser.profilePhoto = objUrl;
            } else {
              this.profileUser.coverPhoto = objUrl;
            }
          } catch (e) {
            console.warn('Could not create object URL for image', url, e);
          }
        },
        error: (err) => {
          console.warn('Failed to fetch image as blob', url, err);
        },
      });
  }

  ngOnInit(): void {
      this.loadingProfile = true;
      this.isProfileViewerOwner = true;
    this.authUser = this.authService.getAuthUserFromToken()!;
      this.profileUserId = this.authService.getAuthUserId()!;
      this.subscriptions.push(
        this.userService
          .getFollowedByAuthUserUserById(this.profileUserId)
          .subscribe((response: any) => {
            if ('user' in response) {
              const foundUser: User = response.user;

              console.log('UserService.getUserById response:', response);

              this.viewerFollowsProfileUser = response.followedByAuthUser;

              if (!foundUser.profilePhoto) {
                foundUser.profilePhoto = environment.defaultProfilePhotoUrl;
              }
              if (!foundUser.coverPhoto) {
                foundUser.coverPhoto = environment.defaultCoverPhotoUrl;
              }

              this.profileUser = foundUser;
              this.loadProfilePosts(1);
              this.loadingProfile = false;
            } else {
              localStorage.setItem(
                AppConstants.messageTypeLabel,
                AppConstants.errorLabel
              );
              localStorage.setItem(
                AppConstants.messageHeaderLabel,
                AppConstants.notFoundErrorHeader
              );
              localStorage.setItem(
                AppConstants.messageDetailLabel,
                AppConstants.notFoundErrorDetail
              );
              localStorage.setItem(
                AppConstants.toLoginLabel,
                AppConstants.falseLabel
              );
              this.loadingProfile = false;
            }
          })
      );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  stopPropagation(e: Event): void {
    e.stopPropagation();
  }

  loadProfilePosts(currentPage: number): void {
    if (!this.fetchingResult) {
      this.fetchingResult = true;
      this.subscriptions.push(
        this.userService
          .getUserPosts(this.profileUserId, currentPage, this.resultSize)
          .subscribe((response: PostResponse[] | HttpErrorResponse) => {
            if (Array.isArray(response)) {
              response.forEach((post) =>
                this.profileUserPostResponses.push(post)
              );
              if (response.length <= 0 && this.resultPage === 1)
                this.hasNoPost = true;
              if (response.length <= 0) this.hasMoreResult = false;
              this.fetchingResult = false;
              this.resultPage++;
            } else {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000,
              });
              this.fetchingResult = false;
            }
          })
      );
    }
  }

  openFollowingDialog(user: User): void {
    this.matDialog.open(FollowingFollowerListDialogComponent, {
      data: {
        user,
        type: 'following',
      },
      autoFocus: false,
      minWidth: '400px',
      maxWidth: '500px',
    });
  }

  openFollowerDialog(user: User): void {
    this.matDialog.open(FollowingFollowerListDialogComponent, {
      data: {
        user,
        type: 'follower',
      },
      autoFocus: false,
      minWidth: '400px',
      maxWidth: '500px',
    });
  }

  openViewPhotoDialog(photoUrl: string): void {
    this.matDialog.open(ViewPhotoDialogComponent, {
      data: photoUrl,
      autoFocus: false,
      maxWidth: '1200px',
    });
  }

  openFollowConfirmDialog(userId: number): void {
    const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: `Do you want to follow ${
        this.profileUser.firstName + ' ' + this.profileUser.lastName
      }?`,
      autoFocus: false,
      maxWidth: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subscriptions.push(
          this.userService.followUser(userId).subscribe({
            next: (response: any) => {
              this.viewerFollowsProfileUser = true;
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: `You are following ${
                  this.profileUser.firstName + ' ' + this.profileUser.lastName
                }.`,
                duration: 5000,
              });
            },
            error: (errorResponse: HttpErrorResponse) => {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000,
              });
            },
          })
        );
      }
    });
  }

  openUnfollowConfirmDialog(userId: number): void {
    const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: `Do you want to stop following ${
        this.profileUser.firstName + ' ' + this.profileUser.lastName
      }?`,
      autoFocus: false,
      maxWidth: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subscriptions.push(
          this.userService.unfollowUser(userId).subscribe({
            next: (response: any) => {
              this.viewerFollowsProfileUser = false;
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: `You no longer follow ${
                  this.profileUser.firstName + ' ' + this.profileUser.lastName
                }.`,
                duration: 5000,
              });
            },
            error: (errorResponse: HttpErrorResponse) => {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000,
              });
            },
          })
        );
      }
    });
  }

  openPhotoUploadDialog(e: Event, uploadType: string): void {
    e.stopPropagation();

    let header: string = '';
    if (uploadType === 'profilePhoto') {
      header = 'Upload Profile Photo';
    } else if (uploadType === 'coverPhoto') {
      header = 'Upload Cover Photo';
    }

    const dialogRef = this.matDialog.open(PhotoUploadDialogComponent, {
      data: { authUser: this.authUser, uploadType, header },
      autoFocus: false,
      minWidth: '300px',
      maxWidth: '900px',
      maxHeight: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (uploadType === 'profilePhoto') {
          this.profileUser.profilePhoto = result.updatedUser.profilePhoto;
        } else if (uploadType === 'coverPhoto') {
          this.profileUser.coverPhoto = result.updatedUser.coverPhoto;
        }
      }
    });
  }

  handlePostDeletedEvent(postResponse: PostResponse): void {
    const postElement = document.getElementById(
      `profilePost${postResponse.post.id}`
    );
    if (postElement) {
      postElement.remove();
    }
  }
}
