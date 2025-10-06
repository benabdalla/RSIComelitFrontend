import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';

import {AddAbsenceModalComponent} from './add-absence-modal/add-absence-modal.component';
import {JustificationModalComponent} from './justification-modal/justification-modal.component';
import {AbsenceService} from '../shared/service/absence.service';
import {Absence} from '../shared/model/absence.model';
import {Page} from '../shared/service/page.model';

@Component({
  selector: 'app-absence-list-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './absence-list-component.component.html',
  styleUrl: './absence-list-component.component.scss'
})
export class AbsenceListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Enhanced columns with avatar and combined name
  allColumns: string[] = ['avatar', 'name', 'date', 'status', 'actions'];
  visibleColumns: string[] = ['avatar', 'name', 'date', 'status', 'actions'];

  absences: Absence[] = [];
  filteredAbsences: Absence[] = [];
  dataSource = new MatTableDataSource<Absence>([]);

  loading = false;
  error: string | null = null;
  selectedAbsence: Absence | null = null;

  // Enhanced filters
  searchText = '';
  statusFilter = '';
  dateFilter: Date | null = null;

  // Pagination
  pageSize = 10;

  // Mobile detection
  isMobile = false;

  constructor(
    private dialog: MatDialog,
    private absenceService: AbsenceService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadAbsences();
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.visibleColumns = ['avatar', 'name', 'status', 'actions'];
    } else {
      this.visibleColumns = ['avatar', 'name', 'date', 'status', 'actions'];
    }
    this.cdr.detectChanges();
  }

  private loadAbsences(): void {
    this.loading = true;
    this.error = null;

    this.absenceService.getAbsences({ page: 1, limit: 100 }).subscribe({
      next: (response: Page<Absence>) => {
        console.log('Service response:', response);

        if (response && Array.isArray(response.data)) {
          // FIXED: Keep date as string to match interface
          this.absences = response.data.map(absence => ({
            ...absence,
            firstName: absence.user?.firstName || absence.firstName || 'N/A',
            lastName: absence.user?.lastName || absence.lastName || 'N/A',
            email: absence.user?.email || absence.email || 'N/A',
            date: absence.date, // Keep as string
            status: absence.status || 'NOT_JUSTIFIED'
          }));
        }

        this.updateFilteredAbsences();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading absences:', error);
        this.error = 'Failed to load absences. Please try again.';
        this.loading = false;
      }
    });
  }

  private updateFilteredAbsences(): void {
    let filtered = [...this.absences];

    // Search filter
    if (this.searchText?.trim()) {
      const searchTerm = this.searchText.toLowerCase();
      filtered = filtered.filter(absence =>
        absence.firstName?.toLowerCase().includes(searchTerm) ||
        absence.lastName?.toLowerCase().includes(searchTerm) ||
        absence.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(absence => absence.status === this.statusFilter);
    }

    // Date filter - FIXED: Compare string dates properly
    if (this.dateFilter) {
      const filterDateString = this.dateFilter.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      filtered = filtered.filter(absence => absence.date === filterDateString);
    }

    this.filteredAbsences = filtered;
    this.dataSource.data = filtered;
  }

  // Enhanced UI Methods
  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VALID': return 'check_circle';
      case 'JUSTIFIED': return 'schedule';
      case 'NOT_JUSTIFIED': return 'error';
      default: return 'help';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALID': return 'status-valid';
      case 'JUSTIFIED': return 'status-justified';
      case 'NOT_JUSTIFIED': return 'status-not-justified';
      default: return 'status-unknown';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'VALID': return 'Valid';
      case 'JUSTIFIED': return 'Justified';
      case 'NOT_JUSTIFIED': return 'Not Justified';
      default: return status;
    }
  }

  getJustifiedCount(): number {
    return this.absences.filter(a => a.status === 'JUSTIFIED').length;
  }

  getPendingCount(): number {
    return this.absences.filter(a => a.status === 'NOT_JUSTIFIED').length;
  }

  // Filter methods
  onSearchChange(): void {
    this.updateFilteredAbsences();
  }

  onStatusFilterChange(): void {
    this.updateFilteredAbsences();
  }

  onDateFilterChange(): void {
    this.updateFilteredAbsences();
  }

  clearSearch(): void {
    this.searchText = '';
    this.updateFilteredAbsences();
  }

  clearDateFilter(): void {
    this.dateFilter = null;
    this.updateFilteredAbsences();
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.dateFilter = null;
    this.updateFilteredAbsences();
  }

  hasFiltersApplied(): boolean {
    return !!(this.searchText || this.statusFilter || this.dateFilter);
  }

  // Table methods
  isColumnVisible(column: string): boolean {
    return this.visibleColumns.includes(column);
  }

  toggleColumn(column: string): void {
    const index = this.visibleColumns.indexOf(column);
    if (index > -1) {
      this.visibleColumns.splice(index, 1);
    } else {
      this.visibleColumns.push(column);
    }
  }

  selectAbsence(absence: Absence): void {
    this.selectedAbsence = this.selectedAbsence === absence ? null : absence;
  }

  isHighlighted(absence: Absence): boolean {
    return this.selectedAbsence === absence;
  }

  // Empty state methods
  getEmptyStateTitle(): string {
    if (this.hasFiltersApplied()) {
      return 'No matching absences found';
    }
    return 'No absences recorded';
  }

  getEmptyStateMessage(): string {
    if (this.hasFiltersApplied()) {
      return 'Try adjusting your search criteria or filters to find what you\'re looking for.';
    }
    return 'Get started by recording the first absence for today.';
  }

  // Action methods
  openAddAbsenceModal(): void {
    const dialogRef = this.dialog.open(AddAbsenceModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {},
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAbsences();
        this.showSuccessMessage('Absence recorded successfully!');
      }
    });
  }

  refreshAbsences(): void {
    this.loadAbsences();
  }

  viewAbsenceDetails(absence: Absence): void {
    // Implementation for viewing details
    console.log('View details for:', absence);
    const dialogRef = this.dialog.open(JustificationModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { absence },
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      this.loadAbsences();
      this.showSuccessMessage('Justification updated successfully!');
      }
    });
    // You can open a dialog or navigate to a details page here
  }

  editJustification(absence: Absence): void {
    // Implementation for editing justification
    console.log('Edit justification for:', absence);
    // You can open a dialog for editing justification here
  }

  validateAbsence(absence: Absence): void {
    this.dialog.open(JustificationModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { absence },
      panelClass: 'custom-dialog'
    });

    if (!absence.id) return;

    this.absenceService.validateAbsence(absence.id).subscribe({
      next: () => {
        // Update the absence status in the local array
        const index = this.absences.findIndex(a => a.id === absence.id);
        if (index !== -1) {
          this.absences[index].status = 'VALID';
        }
        this.updateFilteredAbsences();
        this.showSuccessMessage('Absence validated successfully!');
      },
      error: (error) => {
        console.error('Error validating absence:', error);
        this.showErrorMessage('Failed to validate absence');
      }
    });
  }

  deleteAbsence(absence: Absence): void {
    if (!absence.id) return;

    // Simple confirmation dialog using browser confirm
    const confirmed = confirm(`Are you sure you want to delete the absence for ${absence.firstName} ${absence.lastName}?`);

    if (confirmed) {
      this.absenceService.deleteAbsence(absence.id).subscribe({
        next: () => {
          this.absences = this.absences.filter(a => a.id !== absence.id);
          this.updateFilteredAbsences();
          this.showSuccessMessage('Absence deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting absence:', error);
          this.showErrorMessage('Failed to delete absence');
        }
      });
    }
  }

  duplicateAbsence(absence: Absence): void {
    // Implementation for duplicating absence
    console.log('Duplicate:', absence);
    // You can implement duplication logic here
  }

  exportAbsence(absence: Absence): void {
    // Implementation for exporting single absence
    console.log('Export:', absence);
    // You can implement export logic here
  }

  exportToCsv(): void {
    // Implementation for CSV export
    console.log('Export to CSV');
    // You can implement CSV export logic here
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, '✓', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
