import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CongeRequestService} from '../../shared/service/conge-request.service';
import {CongeRequestModalComponent} from './conge-request-modal.component';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatFabButton, MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {CongeRequest} from '../../shared/model/conges';
import {CongeRequestEventsService} from '../../shared/service/conge-request-events.service';
import {UserSimple} from '../../shared/model/user-simple';
import {UserService} from '../../shared/service/user.service';
import {AuthService} from '../../shared/service/auth.service';


@Component({
  selector: 'app-conge-requests',
  templateUrl: './conge-requests.component.html',
  styleUrls: ['./conge-requests.component.scss'],
  imports: [
    MatTabGroup,
    MatTab,
    MatTable,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatIconModule,
    MatHeaderRow,
    MatRow,
    MatIconButton,
    MatFabButton,
    MatHeaderRowDef,
    MatRowDef,
    MatCellDef,
    MatHeaderCellDef,
    NgIf
  ],
})
export class CongeRequestsComponent implements OnInit {
  myRequests: CongeRequest[] = [];
  toValidateRequests: CongeRequest[] = [];
  currentUserId = 0; // à remplacer par l'id de l'utilisateur connecté

  constructor(
    private congeService: CongeRequestService,
    private dialog: MatDialog,
    private eventsService: CongeRequestEventsService,
    private userService: UserService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.loadRequests();
    this.currentUserId = this.authService.getAuthUserId() ?? 0;
    this.eventsService.getAsObservable().subscribe(() => {
      this.loadRequests();
    });
  }

  loadRequests() {
    this.congeService.getMyRequests(this.currentUserId).subscribe(data => this.myRequests = data);
    this.congeService.getRequestsToValidate(this.currentUserId).subscribe(data => this.toValidateRequests = data);
  }

  openCreateModal() {
    const dialogRef = this.dialog.open(CongeRequestModalComponent, {
      width: '500px',
      data: {mode: 'create', requesterId: this.currentUserId},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadRequests();
    });
  }

  openEditModal(request: CongeRequest) {
    // Récupérer le validateur et remplir validatorOptions
    this.userService.getById(request.validator.id).subscribe((user: any) => {
      if (user && user.id) {
        const userSimple: UserSimple = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        };
        const dialogRef = this.dialog.open(CongeRequestModalComponent, {
          width: '500px',
          data: {mode: 'edit', request, requesterId: this.currentUserId, validator: userSimple}
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.loadRequests();
        });
      }
    });

  }

  sendRequest(request: CongeRequest) {
    this.congeService.sendRequest(request.id!).subscribe(() => this.loadRequests());
  }

  validateRequest(request: CongeRequest, comment?: string) {
    this.congeService.validateRequest(request.id!, this.currentUserId, comment).subscribe(() => this.loadRequests());
  }

  rejectRequest(request: CongeRequest, comment?: string) {
    this.congeService.rejectRequest(request.id!, this.currentUserId, comment).subscribe(() => this.loadRequests());
  }
}
