import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-confirmation-dialog',
	templateUrl: './confirmation-dialog.component.html',
	styleUrls: ['./confirmation-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatDialogContent,
		MatButtonModule
	]
})
export class ConfirmationDialogComponent implements OnInit {

	dataHeader = inject(MAT_DIALOG_DATA) as string;
	constructor() { }

	ngOnInit(): void {
	}
}
