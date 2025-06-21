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
import { QuickActionsComponent } from "./quick-actions.component";
import { StatsCardComponent } from "./stats-card.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    LayoutComponent,
    QuickActionsComponent,
    StatsCardComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styles: [
    `
      /* Enhanced animations and transitions */
      .group:hover .group-hover\:scale-110 {
        transform: scale(1.1);
      }

      .group:hover .group-hover\:shadow-xl {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      /* Smooth transitions for all interactive elements */
      * {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Button hover effects */
      button:hover {
        transform: translateY(-2px);
      }

      button:active {
        transform: translateY(0);
      }

      /* Card hover effects */
      .group:hover {
        transform: translateY(-5px);
      }

      /* Gradient animation */
      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }

        50% {
          background-position: 100% 50%;
        }

        100% {
          background-position: 0% 50%;
        }
      }

      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 6s ease infinite;
      }
    `,
  ],
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
