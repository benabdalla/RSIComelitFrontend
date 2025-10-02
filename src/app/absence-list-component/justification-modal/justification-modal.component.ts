import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-justification-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './justification-modal.component.html',
  styleUrl: './justification-modal.component.scss'
})
export class JustificationModalComponent {
  absence: any;

  constructor(
    public dialogRef: MatDialogRef<JustificationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.absence = data.absence;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onValidate(): void {
    this.dialogRef.close('validated');
  }

  downloadFile(): void {
    // Implement file download logic
    console.log('Downloading file:', this.absence.justificationFile);
  }

  canValidate(): boolean {
    return this.absence.status === 'Justified';
  }
}
