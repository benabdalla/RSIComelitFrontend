import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-waiting-dialog',
	templateUrl: './waiting-dialog.component.html',
	styleUrls: ['./waiting-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		MatDialogContent,
		MatProgressSpinnerModule
	]
})
export class WaitingDialogComponent implements OnInit {

	dataHeader = inject(MAT_DIALOG_DATA) as string;
	constructor() { }

	ngOnInit(): void {
	}

}
