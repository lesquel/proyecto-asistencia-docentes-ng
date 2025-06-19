import { Component, computed, inject, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatTableModule } from "@angular/material/table"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatNativeDateModule } from "@angular/material/core"
import { LayoutComponent, type MenuItem } from "../../../shared/components/layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { TeacherService } from "../../../core/services/teacher.service"
import { AttendanceService } from "../../../core/services/attendance.service"
import type { Attendance } from "../../../core/models/user.model"

@Component({
  selector: "app-teacher-attendance",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    LayoutComponent
],
  template: `
    <app-layout [title]="'Mis Asistencias'" [menuItems]="menuItems">
      <div class="attendance-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Registro de Asistencias</mat-card-title>
            <mat-card-subtitle>Historial de asistencias y horarios</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="filters">
              <mat-form-field appearance="outline">
                <mat-label>Filtrar por fecha</mat-label>
                <input matInput [matDatepicker]="picker" (dateChange)="onDateChange($event)" placeholder="Seleccionar fecha">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              <button mat-button (click)="clearDateFilter()">
                <mat-icon>clear</mat-icon>
                Limpiar Filtro
              </button>
            </div>

            <div class="table-container">
              <table mat-table [dataSource]="filteredAttendances()" class="attendance-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let attendance">
                    {{attendance.date | date:'dd/MM/yyyy'}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="subject">
                  <th mat-header-cell *matHeaderCellDef>Materia</th>
                  <td mat-cell *matCellDef="let attendance">
                    {{getScheduleInfo(attendance.scheduleId)?.subject || 'N/A'}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="time">
                  <th mat-header-cell *matHeaderCellDef>Horario</th>
                  <td mat-cell *matCellDef="let attendance">
                    {{getScheduleInfo(attendance.scheduleId)?.startTime}} - 
                    {{getScheduleInfo(attendance.scheduleId)?.endTime}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="checkIn">
                  <th mat-header-cell *matHeaderCellDef>Entrada</th>
                  <td mat-cell *matCellDef="let attendance">
                    {{attendance.checkIn ? (attendance.checkIn | date:'HH:mm') : '-'}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="checkOut">
                  <th mat-header-cell *matHeaderCellDef>Salida</th>
                  <td mat-cell *matCellDef="let attendance">
                    {{attendance.checkOut ? (attendance.checkOut | date:'HH:mm') : '-'}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let attendance">
                    <mat-chip [color]="getStatusColor(attendance.status)" selected>
                      {{getStatusText(attendance.status)}}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let attendance">
                    <button mat-icon-button 
                            color="primary"
                            *ngIf="canCheckOut(attendance)"
                            (click)="checkOut(attendance)">
                      <mat-icon>logout</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div *ngIf="filteredAttendances().length === 0" class="no-data">
                <mat-icon>event_busy</mat-icon>
                <p>No se encontraron registros de asistencia</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [
    `
    .attendance-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .filters {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .table-container {
      overflow-x: auto;
    }

    .attendance-table {
      width: 100%;
    }

    .attendance-table th,
    .attendance-table td {
      padding: 12px 8px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
  ],
})
export class TeacherAttendanceComponent {
  menuItems: MenuItem[] = [
    { label: "Dashboard", route: "/teacher/dashboard", icon: "dashboard" },
    { label: "Asistencias", route: "/teacher/attendance", icon: "assignment" },
    { label: "Justificaciones", route: "/teacher/justifications", icon: "description" },
  ]

  displayedColumns: string[] = ["date", "subject", "time", "checkIn", "checkOut", "status", "actions"]
  selectedDate = signal<Date | null>(null)

  currentTeacher = computed(() => {
    const user = this.authService.currentUser()
    if (user && user.role === "teacher") {
      return this.teacherService.getTeacherById(user.id)
    }
    return null
  })

  teacherAttendances = computed(() => {
    const teacher = this.currentTeacher()
    if (!teacher) return []
    return this.attendanceService
      .getAttendancesByTeacher(teacher.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  })

  filteredAttendances = computed(() => {
    const attendances = this.teacherAttendances()
    const filterDate = this.selectedDate()

    if (!filterDate) return attendances

    const targetDate = new Date(filterDate)
    targetDate.setHours(0, 0, 0, 0)

    return attendances.filter((a) => {
      const attendanceDate = new Date(a.date)
      attendanceDate.setHours(0, 0, 0, 0)
      return attendanceDate.getTime() === targetDate.getTime()
    })
  })

    private authService = inject(AuthService);
    private teacherService = inject(TeacherService);
    private attendanceService = inject(AttendanceService);



  onDateChange(event: any): void {
    this.selectedDate.set(event.value)
  }

  clearDateFilter(): void {
    this.selectedDate.set(null)
  }

  getScheduleInfo(scheduleId: string) {
    const teacher = this.currentTeacher()
    if (!teacher) return null
    return teacher.schedules.find((s) => s.id === scheduleId)
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      present: "Presente",
      absent: "Ausente",
      late: "Tardanza",
      justified: "Justificado",
    }
    return statusMap[status] || status
  }

  getStatusColor(status: string): "primary" | "accent" | "warn" {
    switch (status) {
      case "present":
        return "primary"
      case "justified":
        return "accent"
      default:
        return "warn"
    }
  }

  canCheckOut(attendance: Attendance): boolean {
    return !!attendance.checkIn && !attendance.checkOut
  }

  checkOut(attendance: Attendance): void {
    const teacher = this.currentTeacher()
    if (teacher) {
      this.attendanceService.checkOut(teacher.id, attendance.scheduleId)
    }
  }
}
