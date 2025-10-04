import {HttpErrorResponse,} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {PostComponent} from '../post/post.component';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {PostResponse} from '../../shared/model/post-response';
import {User} from '../../shared/model/user';
import {environment} from '../../../environments/environment';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {PostService} from '../../shared/service/post.service';


@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.css'],
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
    PostComponent,
  ],
})
export class AllPostsComponent implements OnInit, OnDestroy {
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
    private postServive: PostService,
    private matSnackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfilePosts(1);
  }


  loadProfilePosts(currentPage: number): void {
    if (!this.fetchingResult) {
      this.fetchingResult = true;
      this.subscriptions.push(
        this.postServive
          .getAllPosts(currentPage, this.resultSize)
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

   handlePostDeletedEvent(postResponse: PostResponse): void {
    const postElement = document.getElementById(
      `profilePost${postResponse.post.id}`
    );
    if (postElement) {
      postElement.remove();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }

}


