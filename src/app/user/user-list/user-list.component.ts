import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';

import {PaginationParams, UserProfil} from '../../shared/model/user-profil.model';
import {UserService} from '../../shared/service/user.service';
import {EditUserDialogComponent} from '../edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'salaire',
    'site',
    'processus',
    'yearsOfExperience',
    'actions'
  ];

  dataSource = new MatTableDataSource<UserProfil>();
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  loading = false;

  private paginationParams: PaginationParams = {
    page: 1,
    limit: 10
  };

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

loadUsers(): void {
  this.loading = true;
  this.userService.getUsers(this.paginationParams).subscribe({
    next: (response) => {
      this.dataSource.data = response.users;       // <-- ici
      this.totalItems = response.limit;      // <-- ici
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading users:', error);
      this.snackBar.open('Error loading users', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.loading = false;
    }
  });
}

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.limit = event.pageSize;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.paginationParams.sortBy = sort.active;
    this.paginationParams.sortOrder = sort.direction || 'asc';
    this.loadUsers();
  }

  onSearch(): void {
    this.paginationParams.search = this.searchValue;
    this.paginationParams.page = 1;
    this.pageIndex = 0;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.paginationParams.search = undefined;
    this.paginationParams.page = 1;
    this.pageIndex = 0;
    this.loadUsers();
  }

  editUser(user: UserProfil): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '800px',
      data: { ...user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  deleteUser(user: UserProfil): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('User deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
