import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatBadgeModule} from '@angular/material/badge';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {forkJoin, Subscription} from 'rxjs';
import {Absence} from '../../shared/model/absence.model';
import {AbsenceService} from '../../shared/service/absence.service';
import {Page} from '../../shared/service/page.model';

export interface AbsenceNotification {
  id: string;
  employeeName: string;
  date: Date;
  type: 'NEW_ABSENCE' | 'REMINDER' | 'DEADLINE';
  message: string;
  isRead: boolean;
  absence: Absence;
}

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface JustificationType {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-absence-notification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatBadgeModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './absence-notification.component.html',
  styleUrls: ['./absence-notification.component.scss']
})
export class AbsenceNotificationComponent implements OnInit, OnDestroy {
  // Absence data
  absences: Absence[] = [];
  selectedAbsence: Absence | null = null;
  loading = false;

  // Notification data
  notifications: AbsenceNotification[] = [];
  unreadCount = 0;
  showNotifications = false;

  // Form data
  justificationForm!: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  attachedFiles: AttachedFile[] = [];
  allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.txt'];

  private subscription = new Subscription();

  // Justification types for radio buttons
  justificationTypes: JustificationType[] = [
    { value: 'medical', label: 'Medical Appointment', icon: 'local_hospital' },
    { value: 'personal', label: 'Personal Emergency', icon: 'warning' },
    { value: 'family', label: 'Family Matter', icon: 'family_restroom' },
    { value: 'transport', label: 'Transportation Issue', icon: 'directions_car' },
    { value: 'other', label: 'Other', icon: 'help_outline' }
  ];

  // Updated data property with proper typing
  data: {
    absence: {
      id: number;
      firstName: string;
      lastName: string;
      date: string;
    }
  } = {
    absence: {
      id: 0,
      firstName: '',
      lastName: '',
      date: new Date().toISOString().split('T')[0]
    }
  };

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private absenceService: AbsenceService,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: MatDialogRef<AbsenceNotificationComponent>
  ) {
    // Use dialog data if available
    if (this.dialogData?.absence) {
      this.selectedAbsence = this.dialogData.absence;
      this.data.absence = {
        id: this.dialogData.absence.id || 0,
        firstName: this.dialogData.absence.firstName || '',
        lastName: this.dialogData.absence.lastName || '',
        date: this.dialogData.absence.date || new Date().toISOString().split('T')[0]
      };
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAbsences();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.justificationForm = this.formBuilder.group({
      type: ['', Validators.required],
      startDate: [this.selectedAbsence?.date || new Date().toISOString().split('T')[0], Validators.required],
      endDate: [this.selectedAbsence?.date || new Date().toISOString().split('T')[0], Validators.required],
      isRecurring: [false],
      reason: [this.selectedAbsence?.justificationText || '', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      contactInfo: ['']
    });
  }

  // Form control getters
  get typeControl() { return this.justificationForm.get('type'); }
  get reasonControl() { return this.justificationForm.get('reason'); }
  get startDateControl() { return this.justificationForm.get('startDate'); }
  get endDateControl() { return this.justificationForm.get('endDate'); }

  loadAbsences(): void {
    this.loading = true;

    // Use the existing service method
    const subscription = this.absenceService.getAbsencesNeedingJustification().subscribe({
      next: (absences: Page<Absence>) => {
        this.absences = absences.data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading absences:', error);
        this.snackBar.open('Error loading absences. Loading mock data...', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.loading = false;
      }
    });

    this.subscription.add(subscription);
  }

  selectAbsence(absence: Absence): void {
    this.selectedAbsence = absence;
    // Fixed data assignment with guaranteed values
    this.data.absence = {
      id: absence.id || 0,
      firstName: absence.firstName || '',
      lastName: absence.lastName || '',
      date: absence.date
    };

    // Update form with absence data
    this.justificationForm.patchValue({
      startDate: absence.date,
      endDate: absence.date,
      reason: absence.justificationText || ''
    });

    // Mark notification as read
    const notification = this.notifications.find(n => n.absence.id === absence.id);
    if (notification) {
      this.markAsRead(notification);
    }
  }

  onFileSelect(event: Event): void {
    this.onFileSelected(event);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      Array.from(target.files).forEach(file => {
        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
          this.snackBar.open(`Invalid file type for "${file.name}". Please upload JPEG, PNG, PDF, or TXT files.`, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        if (file.size > maxSize) {
          this.snackBar.open(`File "${file.name}" is too large. Maximum size is 5MB.`, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        // Check for duplicate files
        const isDuplicate = this.attachedFiles.some(attachedFile =>
          attachedFile.name === file.name && attachedFile.size === file.size
        );

        if (isDuplicate) {
          this.snackBar.open(`File "${file.name}" has already been attached.`, 'Close', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          return;
        }

        // Add file to attached files array
        const attachedFile: AttachedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        };

        this.attachedFiles.push(attachedFile);
      });

      // Clear the input
      target.value = '';

      if (target.files.length > 0) {
        this.snackBar.open(`${target.files.length} file(s) attached successfully.`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      }
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf') {
      return 'picture_as_pdf';
    } else if (fileType.startsWith('text/')) {
      return 'description';
    } else {
      return 'attach_file';
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile(index: number): void {
    if (index >= 0 && index < this.attachedFiles.length) {
      const removedFile = this.attachedFiles[index];
      this.attachedFiles.splice(index, 1);

      this.snackBar.open(`File "${removedFile.name}" removed.`, 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    }
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Reset the form and clear attached files
      this.justificationForm.reset();
      this.attachedFiles = [];
      this.selectedFile = null;
      this.selectedAbsence = null;
      this.isSubmitting = false;

      this.snackBar.open('Form cancelled and reset.', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    }
  }

  onSubmit(): void {
    if (this.justificationForm.valid && this.selectedAbsence?.id) {
      this.isSubmitting = true;

      const justificationText = this.justificationForm.get('reason')?.value;

      // Handle file uploads first if there are any
      if (this.attachedFiles.length > 0) {
        this.handleFileUploadsAndJustification(justificationText);
      } else {
        // No files, just update justification text
        this.updateJustificationOnly(justificationText);
      }
    } else {
      this.markFormGroupTouched();

      if (!this.selectedAbsence) {
        this.snackBar.open('Please select an absence to justify.', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      }
    }
  }

  private handleFileUploadsAndJustification(justificationText: string): void {
    if (!this.selectedAbsence?.id) return;

    // Upload files first
    const fileUploadObservables = this.attachedFiles.map(attachedFile =>
      this.absenceService.uploadJustificationFile(this.selectedAbsence!.id!, attachedFile.file)
    );

    const subscription = forkJoin(fileUploadObservables).subscribe({
      next: (uploadResults: { filename: string }[]) => {
        // Files uploaded successfully, now update justification
        const justificationFile = uploadResults.map(result => result.filename).join(',');

        this.updateJustificationWithFile(justificationText, justificationFile);
      },
      error: (error: any) => {
        console.error('Error uploading files:', error);
        this.snackBar.open('Error uploading files. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });

    this.subscription.add(subscription);
  }

  private updateJustificationWithFile(justificationText: string, justificationFile: string): void {
    if (!this.selectedAbsence?.id) return;

    const justificationData = {
      justificationText,
      justificationFile
    };

    const subscription = this.absenceService.updateAbsenceJustification(this.selectedAbsence.id, justificationData).subscribe({
      next: (updatedAbsence: Absence) => {
        this.handleSuccessfulSubmission(updatedAbsence);
      },
      error: (error: any) => {
        console.error('Error updating justification:', error);
        this.snackBar.open('Error submitting justification. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });

    this.subscription.add(subscription);
  }

  private updateJustificationOnly(justificationText: string): void {
    if (!this.selectedAbsence?.id) return;

    const justificationData = {
      justificationText
    };

    const subscription = this.absenceService.updateAbsenceJustification(this.selectedAbsence.id, justificationData).subscribe({
      next: (updatedAbsence: Absence) => {
        this.handleSuccessfulSubmission(updatedAbsence);
      },
      error: (error: any) => {
        console.error('Error updating justification:', error);
        this.snackBar.open('Error submitting justification. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });

    this.subscription.add(subscription);
  }

  private handleSuccessfulSubmission(updatedAbsence: Absence): void {
    this.snackBar.open('Justification submitted successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    // Update local data
    const index = this.absences.findIndex(a => a.id === updatedAbsence.id);
    if (index !== -1) {
      this.absences[index] = updatedAbsence;
    }

    // Remove notification after successful submission
    this.notifications = this.notifications.filter(n => n.absence.id !== this.selectedAbsence?.id);
    this.updateUnreadCount();

    if (this.dialogRef) {
      this.dialogRef.close({ success: true, data: updatedAbsence });
    } else {
      // Reset form
      this.justificationForm.reset();
      this.attachedFiles = [];
      this.selectedFile = null;
      this.selectedAbsence = null;
    }

    this.isSubmitting = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.justificationForm.controls).forEach(key => {
      const control = this.justificationForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: AbsenceNotification): void {
    notification.isRead = true;
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.updateUnreadCount();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'NEW_ABSENCE': return 'warning';
      case 'REMINDER': return 'schedule';
      case 'DEADLINE': return 'priority_high';
      default: return 'notifications';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'NEW_ABSENCE': return 'urgent';
      case 'REMINDER': return 'warning';
      case 'DEADLINE': return 'critical';
      default: return 'info';
    }
  }

  getAbsenceStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'not_justified': return 'status-urgent';
      case 'pending': return 'status-pending';
      case 'justified': return 'status-justified';
      case 'rejected': return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  getAbsenceStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'not_justified': return 'error';
      case 'pending': return 'schedule';
      case 'justified': return 'check_circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  }

  // Legacy getter methods for form validation (maintain compatibility)
  get reason() {
    return this.justificationForm.get('reason');
  }

  get description() {
    return this.justificationForm.get('reason'); // Map to reason for compatibility
  }
}
