import {CommonModule, NgClass} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';

import {AppConstants} from '../../common/app-constants';
import {PostResponse} from '../../shared/model/post-response';
import {Tag} from '../../shared/model/tag';
import {PostService} from '../../shared/service/post.service';
import {TimelineService} from '../../shared/service/timeline.service';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {PostComponent} from '../post/post.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    PostComponent
  ]
})
export class TimelineComponent implements OnInit, OnDestroy {
  timelinePostResponseList: PostResponse[] = [];
  timelineTagList: Tag[] = [];
  noPost: boolean = false;
  resultPage: number = 1;
  resultSize: number = 5;
  hasMoreResult: boolean = true;
  fetchingResult: boolean = false;
  isTaggedPostPage: boolean = false;
  targetTagName: string = ''; // Initialize to prevent null issues
  loadingTimelinePostsInitially: boolean = true;
  loadingTimelineTagsInitially: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private timelineService: TimelineService,
    private postService: PostService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matSnackbar: MatSnackBar) { }

  ngOnInit(): void {
      if (this.router.url !== '/') {
        const tag = this.activatedRoute.snapshot.paramMap.get('tagName');
        if (tag) {
          this.targetTagName = tag;
          this.isTaggedPostPage = true;
          this.loadTaggedPosts(tag, 1);
        } else {
          this.loadTimelinePosts(1);
        }
      } else {
        this.loadTimelinePosts(1);
      }
      this.loadTimelineTags();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTimelinePosts(currentPage: number): void {
    if (!this.fetchingResult) {
      this.fetchingResult = true;
      this.subscriptions.push(
        this.timelineService.getTimelinePosts(currentPage, this.resultSize).subscribe({
          next: (response: PostResponse[] | HttpErrorResponse) => {
            this.fetchingResult = false;

            if (Array.isArray(response)) {
              if (response.length === 0 && currentPage === 1) this.noPost = true;

              response.forEach(pR => this.timelinePostResponseList.push(pR));

              this.hasMoreResult = response.length > 0;

              this.resultPage++;
              this.loadingTimelinePostsInitially = false;
            } else {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000
              });
            }
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
            this.fetchingResult = false;
          }
        })
      );
    }
  }

  loadTaggedPosts(tagName: string, currentPage: number): void {
    if (!this.fetchingResult) {
      this.fetchingResult = true;
      this.subscriptions.push(
        this.postService.getPostsByTag(tagName, currentPage, this.resultSize).subscribe({
          next: (response: PostResponse[] | HttpErrorResponse) => {
            this.fetchingResult = false;

            if (Array.isArray(response)) {
              if (response.length === 0 && currentPage === 1) this.noPost = true;

              response.forEach(pR => this.timelinePostResponseList.push(pR));
              if (response.length > 0) {
                this.hasMoreResult = true;
              } else {
                this.hasMoreResult = false;
              }
              this.resultPage++;
            } else {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000
              });
            }
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
            this.fetchingResult = false;
          }
        })
      );
    }
  }

  loadTimelineTags(): void {
    this.fetchingResult = true;
    this.subscriptions.push(
      this.timelineService.getTimelineTags().subscribe({
        next: (response: Tag[] | HttpErrorResponse) => {
          this.fetchingResult = false;

          if (Array.isArray(response)) {
            response.forEach(t => this.timelineTagList.push(t));
            this.loadingTimelineTagsInitially = false;
          } else {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: AppConstants.snackbarErrorContent,
            panelClass: ['bg-danger'],
            duration: 5000
          });
          this.fetchingResult = false;
        }
      })
    );
  }
}
