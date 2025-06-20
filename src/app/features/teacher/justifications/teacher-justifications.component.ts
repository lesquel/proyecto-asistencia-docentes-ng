import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { JustificationFormDialogComponent } from './justification-form-dialog.component';

@Component({
  selector: 'app-teacher-justifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LayoutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-justifications.component.html',
})
export class TeacherJustificationsComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Asistencias', route: '/teacher/attendance', icon: 'assignment' },
    {
      label: 'Justificaciones',
      route: '/teacher/justifications',
      icon: 'description',
    },
    { label: "Horarios", route: "/teacher/schedule", icon: "schedule" },

  ];

  displayedColumns: string[] = [
    'date',
    'reason',
    'status',
    'createdAt',
    'reviewedAt',
  ];

  currentTeacher = computed(() => {
    const user = this.authService.currentUser();
    return user && user.role === 'teacher' ? user : null;
  });

  teacherJustifications = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return [];
    return this.attendanceService
      .getJustificationsByTeacher(teacher.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private dialog: MatDialog
  ) {}

  openJustificationDialog(): void {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    const dialogRef = this.dialog.open(JustificationFormDialogComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.teacherId = teacher.id;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'approved':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'rejected':
        return 'warn';
      default:
        return 'accent';
    }
  }
}
