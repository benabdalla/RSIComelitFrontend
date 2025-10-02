import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
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
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,MatDatepickerModule,
  MatNativeDateModule,
  ],

  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  @Output() userAdded = new EventEmitter<UserProfil>();

  userForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
previewUrl: string | ArrayBuffer | null = null;



  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.createForm();
  }




  genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  experienceOptions = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Expert Level', label: 'Expert Level' }
  ];

  siteOptions = [
    { value: 'Tunise', label: 'Tunise' },
    { value: 'Italia', label: 'Italia' },
    { value: 'France', label: 'France' }

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
      yearsOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
          avatar: [null]  // ✅ new field for image

    });
  }


  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedFile = input.files[0];

    // Update form control
    this.userForm.patchValue({ avatar: this.selectedFile });

    // Preview image
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }
}
onSubmit(): void {
  if (this.userForm.valid) {
    this.isSubmitting = true;
    const userData: UserProfil = this.userForm.value;

    this.userService.addUser(userData,this.selectedFile || undefined).subscribe({
      next: (createdUser) => {
        // Success snackbar
        const snackBarRef = this.snackBar.open('User added successfully!', 'Close', {
          duration: 3000
        });

        // Apply inline styles using overlay container
        snackBarRef.afterOpened().subscribe(() => {
          const overlayContainer = snackBarRef.containerInstance._elementRef.nativeElement as HTMLElement;
          overlayContainer.style.backgroundColor = '#4caf50';
          overlayContainer.style.color = 'white';
          overlayContainer.style.fontWeight = 'bold';
          overlayContainer.style.textAlign = 'center';
          overlayContainer.style.fontSize = '14px';
        });

        this.userAdded.emit(createdUser);
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding user:', error);

        const errorMessage = error?.error?.message || 'Error adding user. Please try again.';

        // Error snackbar
        const snackBarRef = this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });

        snackBarRef.afterOpened().subscribe(() => {
          const overlayContainer = snackBarRef.containerInstance._elementRef.nativeElement as HTMLElement;
          overlayContainer.style.backgroundColor = '#f44336';
          overlayContainer.style.color = 'white';
          overlayContainer.style.fontWeight = 'bold';
          overlayContainer.style.textAlign = 'center';
          overlayContainer.style.fontSize = '14px';
        });

        this.isSubmitting = false;
      }
    });
  } else {
    this.markFormGroupTouched();
  }
}



  resetForm(): void {
    this.userForm.reset();
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.setErrors(null);
    });
    this.selectedFile = null;
    this.previewUrl = null;
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
