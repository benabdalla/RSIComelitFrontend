import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UserProfil} from '../../shared/model/user-profil.model';
import {UserService} from '../../shared/service/user.service';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;

  genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  experienceOptions = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Expert Level', label: 'Expert Level' }
  ];

  siteOptions = [
    { value: 'New York', label: 'New York' },
    { value: 'London', label: 'London' },
    { value: 'Paris', label: 'Paris' },
    { value: 'Tokyo', label: 'Tokyo' },
    { value: 'Remote', label: 'Remote' }
  ];

  processusOptions = [
    { value: 'Development', label: 'Development' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Design', label: 'Design' },
    { value: 'Management', label: 'Management' },
    { value: 'Support', label: 'Support' }
  ];

  certificationOptions = [
    { value: 'None', label: 'None' },
    { value: 'AWS Certified', label: 'AWS Certified' },
    { value: 'Microsoft Certified', label: 'Microsoft Certified' },
    { value: 'Google Cloud Certified', label: 'Google Cloud Certified' },
    { value: 'Scrum Master', label: 'Scrum Master' },
    { value: 'PMP', label: 'PMP' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProfil
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      salaire: ['', [Validators.required, Validators.min(0), Validators.max(999999)]],
      experience: ['', Validators.required],
      dateDebutContrat: ['', Validators.required],
      site: ['', Validators.required],
      processus: ['', Validators.required],
      cin: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      gender: ['', Validators.required],
      hoursOfWork: ['', [Validators.required, Validators.min(1), Validators.max(80)]],
      certification: ['', Validators.required],
      yearsOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]]
    });
  }

  private populateForm(): void {
    this.userForm.patchValue({
      firstName: this.data.firstName,
      lastName: this.data.lastName,
      email: this.data.email,
      salaire: this.data.salaire,
      experience: this.data.experience,
      dateDebutContrat: new Date(this.data.dateDebutContrat),
      site: this.data.site,
      processus: this.data.processus,
      cin: this.data.cin,
      gender: this.data.gender,
      hoursOfWork: this.data.hoursOfWork,
      certification: this.data.certification,
      yearsOfExperience: this.data.yearsOfExperience
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && this.data.id) {
      this.isSubmitting = true;
      const userData: UserProfil = {...this.userForm.value, id: this.data.id};

      this.userService.updateUser(this.data.id, userData).subscribe({
        next: (updatedUser) => {
          this.dialogRef.close(updatedUser);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} is too short`;
    }
    if (control?.hasError('maxlength')) {
      return `${fieldName} is too long`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} value is too low`;
    }
    if (control?.hasError('max')) {
      return `${fieldName} value is too high`;
    }
    return '';
  }
}
