import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {
  LayoutComponent,
  MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    LayoutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Docentes', route: '/admin/teachers', icon: 'people' },
    { label: 'Horarios', route: '/admin/schedules', icon: 'schedule' },
    { label: 'Asistencias', route: '/admin/attendance', icon: 'assignment' },
  ];

  totalTeachers = computed(() => this.teacherService.teachers().length);
  totalSchedules = computed(() =>
    this.teacherService
      .teachers()
      .reduce((total, teacher) => total + teacher.schedules.length, 0)
  );
  todayAttendances = computed(() => {
    const today = new Date();
    return this.attendanceService.getAttendancesByDate(today).length;
  });
  pendingJustifications = computed(
    () => this.attendanceService.getPendingJustifications().length
  );

  constructor(
    private teacherService: TeacherService,
    private attendanceService: AttendanceService
  ) {}
}
