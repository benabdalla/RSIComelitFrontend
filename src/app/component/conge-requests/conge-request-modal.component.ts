import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {CongeRequestService} from '../../shared/service/conge-request.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {UserService} from '../../shared/service/user.service';
import {UserSimple} from '../../shared/model/user-simple';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import {SaveCongeRequest} from '../../shared/model/conges';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {CongeRequestEventsService} from '../../shared/service/conge-request-events.service';

@Component({
  selector: 'app-conge-request-modal',
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatInput,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    MatDialogTitle
  ],
  templateUrl: './conge-request-modal.component.html',
  styleUrls: ['./conge-request-modal.component.scss']
})
export class CongeRequestModalComponent {
  form: FormGroup;
  validatorOptions: UserSimple[] = [];
  isLoadingValidator = false;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<CongeRequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private congeService: CongeRequestService,
    private userService: UserService,
    private fb: FormBuilder,
    private eventsService: CongeRequestEventsService
  ) {
    this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      validatorId: ['', Validators.required],
      reason: ['', Validators.required],
      validatorSearch: ['']
    }, {validators: this.dateValidator});

    if (data.mode === 'edit' && data.request) {
      this.validatorOptions = [data.validator];
      this.form.patchValue({
        startDate: data.request.startDate,
        endDate: data.request.endDate,
        validatorId: data.request.id,
        reason: data.request.reason,
        validatorSearch: [`${data.validator.firstName} ${data.validator.lastName}`]
      });
    }

    // Ajout de l'abonnement sur validatorSearch
    this.form.get('validatorSearch')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((query: string) => !!query && query.length >= 3),
      switchMap((query: string) => this.onValidatorSearchChange(query))
    ).subscribe(users => {
      this.validatorOptions = users.map(u => ({...u, fullname: u.firstName + ' ' + u.lastName}));
      this.isLoadingValidator = false;
    });
  }

  dateValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    // Start date required
    if (!start) {
      group.get('startDate')?.setErrors({required: true});
    } else {
      group.get('startDate')?.setErrors(null);
    }
    // End date required and must be >= start date
    if (!end) {
      group.get('endDate')?.setErrors({required: true});
    } else if (start && end && end < start) {
      group.get('endDate')?.setErrors({dateInvalid: true});
    } else {
      group.get('endDate')?.setErrors(null);
    }
    // Validator required
    if (!group.get('validatorId')?.value) {
      group.get('validatorId')?.setErrors({required: true});
    } else {
      group.get('validatorId')?.setErrors(null);
    }
    // Reason required
    if (!group.get('reason')?.value) {
      group.get('reason')?.setErrors({required: true});
    } else {
      group.get('reason')?.setErrors(null);
    }
    return null;
  }

  onValidatorSearchChange(query: string): Observable<UserSimple[]> {
    this.isLoadingValidator = true;
    if (query && query.length >= 3) {
      return this.userService.simpleUserSearch(query);
    } else {
      this.isLoadingValidator = false;
      return of([]);
    }
  }

  selectValidateur(event: MatAutocompleteSelectedEvent) {
    const selectedId = event.option.value;
    this.form.get('validatorId')?.setValue(selectedId);
    const selectedUser = this.validatorOptions.find(u => u.id === selectedId);
    if (selectedUser) {
      this.form.get('validatorSearch')?.setValue(`${selectedUser.firstName} ${selectedUser.lastName}`);
    }
  }

  save() {
    this.errorMessage = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const req: SaveCongeRequest = {
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      requesterId: this.data.requesterId,
      validatorId: this.form.value.validatorId,
      reason: this.form.value.reason
    };
    if (this.data.mode === 'create') {
      this.congeService.createDraft(req).subscribe(() => {
        this.eventsService.triggerRefresh();
        this.close();
      });
    } else {
      this.congeService.updateDraft(this.data.request.id!, req, this.data.requesterId).subscribe(() => {
        this.eventsService.triggerRefresh();
        this.close();
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
