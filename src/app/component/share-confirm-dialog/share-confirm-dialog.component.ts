import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router, RouterModule} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Post} from '../../shared/model/post';
import {PostService} from '../../shared/service/post.service';
import {environment} from '../../../environments/environment';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
  selector: 'app-share-confirm-dialog',
  templateUrl: './share-confirm-dialog.component.html',
  styleUrls: ['./share-confirm-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class ShareConfirmDialogComponent implements OnInit, OnDestroy {
  targetPostId!: number;        // ✅ definite assignment
  shareFormGroup!: FormGroup;   // ✅ definite assignment
  creatingShare = false;
  defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;

  private subscriptions: Subscription[] = [];

  dataPost = inject(MAT_DIALOG_DATA) as Post;

  constructor(
    private thisMatDialogRef: MatDialogRef<ShareConfirmDialogComponent>,
    private router: Router,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private matSnackbar: MatSnackBar
  ) {}

  get content() {
    return this.shareFormGroup.get('content');
  }

  ngOnInit(): void {
    this.shareFormGroup = this.formBuilder.group({
      content: new FormControl('', [Validators.maxLength(4096)])
    });

    this.targetPostId = this.dataPost.isTypeShare
      ? this.dataPost.sharedPost.id
      : this.dataPost.id;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createNewPostShare(): void {
    if (this.creatingShare) return;

    this.creatingShare = true;

    this.subscriptions.push(
      this.postService.createPostShare(this.targetPostId, this.content?.value ?? '').subscribe({
        next: (response: Post | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) return;
          const newPostShare = response;
          this.thisMatDialogRef.close();
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Post shared successfully.',
            panelClass: ['bg-success'],
            duration: 5000
          });
          this.creatingShare = false;
          this.router.navigateByUrl(`/posts/${newPostShare.id}`);
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: AppConstants.snackbarErrorContent,
            panelClass: ['bg-error'],
            duration: 5000
          });
          this.creatingShare = false;
        }
      })
    );
  }
}
