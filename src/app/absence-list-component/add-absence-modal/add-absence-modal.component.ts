import { Component, Inject, OnInit } from '@angular/core';
import {UserService} from '../../shared/service/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbsenceService } from '../../shared/service/absence.service';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  isOnline?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

// Move interface to top level
export interface CreateAbsenceRequest {
  userId: number;
  date: string;
  justificationText?: string;
  justificationFile?: string;
}

@Component({
  selector: 'app-add-absence-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-absence-modal.component.html',
  styleUrl: './add-absence-modal.component.scss'
})
export class AddAbsenceModalComponent implements OnInit {
  currentDate = new Date();
  selectedUser: User | null = null;
  userSearchText = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  totalItems = 0;
  saving = false; // Add saving state

  paginationParams: PaginationParams = {
    page: 1,
    limit: 100,
    search: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddAbsenceModalComponent>,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private absenceService: AbsenceService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.paginationParams).subscribe({
      next: (response: any) => {
        this.users = response.users || response.data || response;
        this.totalItems = response.total || response.limit || this.users.length;
        this.filteredUsers = [...this.users];
        this.loading = false;
        console.log('Loaded users:', this.users.length);
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  filterUsers(): void {
    if (!this.userSearchText.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const searchTerm = this.userSearchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.firstName?.toLowerCase().includes(searchTerm) ||
      user.lastName?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      (user.department && user.department.toLowerCase().includes(searchTerm))
    );
  }

  onSearchChange(): void {
    this.filterUsers();
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Corrected onSave method
  onSave(): void {
    if (!this.selectedUser || this.saving) {
      return;
    }

    this.saving = true;

    // Create CLEAN absence request - NO justificationText field at all
    const absenceRequest: CreateAbsenceRequest = {
      userId: this.selectedUser.id,
      date: this.getCurrentDateString() // Just userId and date, nothing else
      // DO NOT include justificationText or justificationFile
    };

    console.log('Sending clean absence request:', absenceRequest);

    this.absenceService.createAbsence(absenceRequest).subscribe({
      next: (response) => {
        this.saving = false;
        this.snackBar.open(
          `Absence recorded successfully for ${this.selectedUser?.firstName} ${this.selectedUser?.lastName}`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error creating absence:', error);
        this.saving = false;

        let errorMessage = 'Error recording absence';
        if (error.status === 409) {
          errorMessage = 'Absence already recorded for this date';
        } else if (error.status === 404) {
          errorMessage = 'User not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000, panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Helper method to get current date in YYYY-MM-DD format
  private getCurrentDateString(): string {
    const today = new Date();
    return today.getFullYear() + '-' +
           String(today.getMonth() + 1).padStart(2, '0') + '-' +
           String(today.getDate()).padStart(2, '0');
  }

  isSaveEnabled(): boolean {
    return this.selectedUser !== null && !this.loading && !this.saving;
  }

  hasUsers(): boolean {
    return this.users.length > 0;
  }

  // Get save button text based on state
  getSaveButtonText(): string {
    if (this.saving) {
      return 'Recording...';
    }
    if (this.loading) {
      return 'Loading...';
    }
    if (this.selectedUser) {
      return 'Record Absence';
    }
    return 'Please Select Employee';
  }
}
