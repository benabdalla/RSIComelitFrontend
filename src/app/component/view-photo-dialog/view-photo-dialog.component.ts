import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-view-photo-dialog',
	templateUrl: './view-photo-dialog.component.html',
	styleUrls: ['./view-photo-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		MatDialogContent
	]
})
export class ViewPhotoDialogComponent implements OnInit {

	dataUrl = inject(MAT_DIALOG_DATA) as string;
	constructor() { }

	ngOnInit(): void {
	}

}
