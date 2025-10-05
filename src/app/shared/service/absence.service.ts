import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, forkJoin, map, Observable, of} from 'rxjs';
import {
  Absence,
  AbsencePaginationParams,
  AbsenceResponse,
  CreateAbsenceRequest,
  EmployeeWithAbsence,
  User
} from '../../../app/shared/model/absence.model';
import {environment} from '../../../environments/environment';
import {Page} from './page.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private apiUrl = `${environment.apiUrl}/absences`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Create a new absence record - FIXED URL
   */
  createAbsence(absenceData: CreateAbsenceRequest): Observable<Absence> {
    return this.http.post<Absence>(this.apiUrl, absenceData);
  }

  /**
   * Create absence for today
   */
  createTodayAbsence(userId: number): Observable<Absence> {
    return this.http.post<Absence>(`${this.apiUrl}/today/${userId}`, {});
  }

  /**
   * Get all absences with pagination and filters
   */
  getAbsences(params?: AbsencePaginationParams): Observable<AbsenceResponse> {
    let httpParams = new HttpParams();

    if (params) {
      httpParams = httpParams
        .set('page', params.page.toString())
        .set('limit', params.limit.toString());

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.date) {
        httpParams = httpParams.set('date', params.date);
      }
    }

    return this.http.get<AbsenceResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get today's absences
   */
  getTodayAbsences(): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.apiUrl}/today`);
  }

  /**
   * Get absence by ID
   */
  getAbsenceById(id: number): Observable<Absence> {
    return this.http.get<Absence>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update absence justification
   */
  updateAbsenceJustification(id: number, data: { justificationText?: string, justificationFile?: string }): Observable<Absence> {
    return this.http.patch<Absence>(`${this.apiUrl}/${id}/justify`, data);
  }

  /**
   * Validate absence (change status to Valid)
   */
  validateAbsence(id: number): Observable<Absence> {
    return this.http.patch<Absence>(`${this.apiUrl}/${id}/validate`, {});
  }

  /**
   * Delete absence
   */
  deleteAbsence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload justification file
   */
  uploadJustificationFile(absenceId: number, file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string }>(`${this.apiUrl}/${absenceId}/upload`, formData);
  }

  /**
   * Download justification file
   */
  downloadJustificationFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${filename}`, {
      responseType: 'blob'
    });
  }

  // NEW METHODS FOR DYNAMIC EMPLOYEE LIST

  /**
   * Get employees with their absence status for today - SIMPLIFIED VERSION
   */
  getEmployeesWithAbsenceStatus(): Observable<EmployeeWithAbsence[]> {
    // For now, get users directly or use mock data until UserService is ready
    const getAllUsersObservable = this.http.get<User[]>(`${environment.apiUrl}/api/v1/users`).pipe(
      catchError((error: any) => {
        console.error('Error fetching users:', error);
        // Return mock data for testing
        return of([
          { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', isActive: true },
          { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', isActive: true },
          { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', isActive: true }
        ] as User[]);
      })
    );

    return forkJoin({
      users: getAllUsersObservable,
      absences: this.getTodayAbsences().pipe(
        catchError((error: any) => {
          console.error('Error fetching today absences:', error);
          return of([] as Absence[]);
        })
      )
    }).pipe(
      map(({ users, absences }: { users: User[], absences: Absence[] }) => {
        console.log('Loaded users:', users.length);
        console.log('Loaded today absences:', absences.length);

        const absenceMap = new Map<number, Absence>();
        absences.forEach((absence: Absence) => {
          if (absence.userId || absence.user?.id) {
            const userId = absence.userId || absence.user!.id;
            absenceMap.set(userId, absence);
          }
        });

        return users.map((user: User) => {
          const todayAbsence = absenceMap.get(user.id);

          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            department: user.department,
            isActive: user.isActive,
            isOnline: user.isOnline,
            hasAbsenceToday: !!todayAbsence,
            todayAbsence: todayAbsence,
            absenceStatus: todayAbsence?.status || 'Present',
            absenceDate: todayAbsence?.date,
            justificationText: todayAbsence?.justificationText
          } as EmployeeWithAbsence;
        });
      }),
      catchError((error: any) => {
        console.error('Error in getEmployeesWithAbsenceStatus:', error);
        return of([] as EmployeeWithAbsence[]);
      })
    );
  }

  /**
   * Get employees with absence history (paginated)
   */
  getEmployeesWithAbsenceHistory(params?: AbsencePaginationParams): Observable<{employees: EmployeeWithAbsence[], total: number}> {
    const paginationParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search,
      status: params?.status,
      date: params?.date
    };

    return this.getAbsences(paginationParams).pipe(
      map(response => {
        const employees: EmployeeWithAbsence[] = response.absences.map(absence => ({
          id: absence.user?.id || absence.userId || 0,
          firstName: absence.user?.firstName || 'Unknown',
          lastName: absence.user?.lastName || 'User',
          email: absence.user?.email || 'No email',
          department: absence.user?.department,
          isActive: true,
          hasAbsenceToday: this.isToday(absence.date),
          todayAbsence: this.isToday(absence.date) ? absence : undefined,
          absenceStatus: absence.status,
          absenceDate: absence.date,
          justificationText: absence.justificationText
        }));

        return {
          employees,
          total: response.total || employees.length
        };
      }),
      catchError(error => {
        console.error('Error in getEmployeesWithAbsenceHistory:', error);
        return of({ employees: [], total: 0 });
      })
    );
  }

  /**
   * Get all employees (users) - Alternative method if UserService is not available
   */
  getAllEmployees(): Observable<User[]> {
    // If you don't have a separate UserService, you can get users from absence data
    // This is a fallback method
    return this.http.get<User[]>(`${environment.apiUrl}/api/v1/users`).pipe(
      catchError(error => {
        console.error('Error fetching all employees:', error);
        return of([]);
      })
    );
  }

  /**
   * Get employees with filters (search, department, etc.)
   */
  getFilteredEmployees(searchTerm?: string, department?: string): Observable<User[]> {
    let params = new HttpParams();

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (department) {
      params = params.set('department', department);
    }

    return this.http.get<User[]>(`${environment.apiUrl}/api/v1/users`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching filtered employees:', error);
        return of([]);
      })
    );
  }

  /**
   * Helper method to check if date is today
   */
  private isToday(dateString: string): boolean {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  /**
   * Get current date string in YYYY-MM-DD format
   */
  getCurrentDateString(): string {
    const today = new Date();
    return today.getFullYear() + '-' +
           String(today.getMonth() + 1).padStart(2, '0') + '-' +
           String(today.getDate()).padStart(2, '0');
  }

  /**
   * Get absence statistics
   */
  getAbsenceStatistics(): Observable<{
    totalAbsencesToday: number;
    totalEmployees: number;
    presentToday: number;
    notJustified: number;
    justified: number;
    valid: number;
  }> {
    return this.getEmployeesWithAbsenceStatus().pipe(
      map(employees => {
        const totalEmployees = employees.length;
        const absentToday = employees.filter(emp => emp.hasAbsenceToday);
        const totalAbsencesToday = absentToday.length;
        const presentToday = totalEmployees - totalAbsencesToday;

        const notJustified = absentToday.filter(emp => emp.absenceStatus === 'NOT_JUSTIFIED').length;
        const justified = absentToday.filter(emp => emp.absenceStatus === 'JUSTIFIED').length;
        const valid = absentToday.filter(emp => emp.absenceStatus === 'VALID').length;

        return {
          totalAbsencesToday,
          totalEmployees,
          presentToday,
          notJustified,
          justified,
          valid
        };
      }),
      catchError(error => {
        console.error('Error getting absence statistics:', error);
        return of({
          totalAbsencesToday: 0,
          totalEmployees: 0,
          presentToday: 0,
          notJustified: 0,
          justified: 0,
          valid: 0
        });
      })
    );
  }

  /**
   * Bulk operations - Create multiple absences
   */
  createMultipleAbsences(userIds: number[], date?: string): Observable<Absence[]> {
    const targetDate = date || this.getCurrentDateString();
    const requests = userIds.map(userId =>
      this.createAbsence({ userId, date: targetDate })
    );

    return forkJoin(requests).pipe(
      catchError(error => {
        console.error('Error creating multiple absences:', error);
        return of([]);
      })
    );
  }

  /**
   * Get absence report for date range
   */
  getAbsenceReport(startDate: string, endDate: string): Observable<EmployeeWithAbsence[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('limit', '1000'); // Get all records for report

    return this.http.get<AbsenceResponse>(`${this.apiUrl}/report`, { params }).pipe(
      map(response => response.absences.map(absence => ({
        id: absence.user?.id || absence.userId || 0,
        firstName: absence.user?.firstName || 'Unknown',
        lastName: absence.user?.lastName || 'User',
        email: absence.user?.email || 'No email',
        department: absence.user?.department,
        isActive: true,
        hasAbsenceToday: this.isToday(absence.date),
        todayAbsence: absence,
        absenceStatus: absence.status,
        absenceDate: absence.date,
        justificationText: absence.justificationText
      }))),
      catchError(error => {
        console.error('Error getting absence report:', error);
        return of([]);
      })
    );
  }

  // Additional methods for new requirements

  /**
   * Update absence justification (new method)
   */
  updateAbsenceJustificationNew(id: number, justificationData: FormData): Observable<Absence> {
    return this.http.put<Absence>(`${this.apiUrl}/${id}/justification`, justificationData);
  }

  /**
   * Get absences that need justification
   */
  getAbsencesNeedingJustification(): Observable<Page<Absence>> {
    return this.http.get<Page<Absence>>(`${this.apiUrl}/needing-justification`);
  }
}
