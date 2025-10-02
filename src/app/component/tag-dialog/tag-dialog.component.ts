import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-tag-dialog',
	templateUrl: './tag-dialog.component.html',
	styleUrls: ['./tag-dialog.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule
	]
})
export class TagDialogComponent implements OnInit {
	tagFormGroup!: FormGroup;

	constructor(
		private thisDialogRef: MatDialogRef<TagDialogComponent>,
		private formBuilder: FormBuilder) { }

	get name() { return this.tagFormGroup.get('name'); }

	ngOnInit(): void {
		this.tagFormGroup = this.formBuilder.group({
			name: new FormControl('', [Validators.minLength(3), Validators.maxLength(64)])
		});
	}

	addTag(e: Event): void {
		e.preventDefault();
		this.thisDialogRef.close({tagName: this.name ? this.name.value : null});
		this.tagFormGroup.reset();
		Object.keys(this.tagFormGroup.controls).forEach(key => {
			this.tagFormGroup.get(key)!.setErrors(null);
		});
	}
}
