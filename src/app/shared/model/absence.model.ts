export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  isActive?: boolean;
  isOnline?: boolean;
}

export interface Absence {
  id?: number;
  userId?: number;
  user?: User;
  date: string; // Keep as string - format: 'YYYY-MM-DD'
  status: string;
  firstName?: string; // Add these for display
  lastName?: string;  // Add these for display
  email?: string;     // Add these for display
  justificationText?: string;
  justificationFile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAbsenceRequest {
  userId: number;
  date: string;
  justificationText?: string;
  justificationFile?: string;
}

export interface AbsenceResponse {
  absences: Absence[];
  total: number;
  page: number;
  limit: number;
}

export interface AbsencePaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  date?: string;
}

export interface EmployeeWithAbsence {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  isActive?: boolean;
  isOnline?: boolean;
  hasAbsenceToday?: boolean;
  todayAbsence?: Absence;
  absenceStatus?: string;
  absenceDate?: string;
  justificationText?: string;
}
