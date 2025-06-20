import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatChipsModule } from "@angular/material/chips"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { RouterModule } from "@angular/router"
import { LayoutComponent, type MenuItem } from "../../../shared/components/layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { TeacherService } from "../../../core/services/teacher.service"
import { AttendanceService } from "../../../core/services/attendance.service"
import type { Schedule } from "../../../core/models/user.model"

@Component({
  selector: "app-teacher-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    RouterModule,
    LayoutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout [title]="'Panel del Docente'" [menuItems]="menuItems">
      <div class="teacher-dashboard-container">
        <div class="welcome-section">
          <h1>Bienvenido, {{currentTeacher()?.name}}</h1>
          <p>{{currentTeacher()?.department}} - {{currentTeacher()?.employeeId}}</p>
        </div>

        <!-- Debug info -->
        <div class="debug-section" *ngIf="showDebug">
          <mat-card>
            <mat-card-content>
              <h3>Debug Info:</h3>
              <p>Profesor ID: {{currentTeacher()?.id}}</p>
              <p>Día actual: {{today.getDay()}} ({{getDayName(today.getDay())}})</p>
              <p>Horarios hoy: {{todaySchedules().length}}</p>
              <button mat-button (click)="debugAttendances()">Ver Asistencias</button>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon schedules">schedule</mat-icon>
                <div class="stat-info">
                  <h2>{{totalSchedules()}}</h2>
                  <p>Horarios Asignados</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon attendance">check_circle</mat-icon>
                <div class="stat-info">
                  <h2>{{monthlyAttendances()}}</h2>
                  <p>Asistencias Este Mes</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon pending">pending</mat-icon>
                <div class="stat-info">
                  <h2>{{pendingJustifications()}}</h2>
                  <p>Justificaciones Pendientes</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="content-grid">
          <mat-card class="schedule-card">
            <mat-card-header>
              <mat-card-title>Horarios de Hoy</mat-card-title>
              <mat-card-subtitle>{{getDayName(today.getDay())}}, {{today.toLocaleDateString()}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-actions" *ngIf="todaySchedules().length > 0">
                <button mat-raised-button 
                        color="accent" 
                        (click)="registerAllTodayClasses()"
                        class="register-all-btn">
                  <mat-icon>how_to_reg</mat-icon>
                  Registrar Todas las Asistencias de Hoy
                </button>
              </div>
              
              <div *ngIf="todaySchedules().length === 0" class="no-schedules">
                <mat-icon>event_available</mat-icon>
                <p>No tienes clases programadas para hoy</p>
                <p><small>Día actual: {{getDayName(today.getDay())}}</small></p>
              </div>
              
              <div *ngFor="let schedule of todaySchedules(); trackBy: trackByScheduleId" class="schedule-item">
                <div class="schedule-info">
                  <h3>{{schedule.subject}}</h3>
                  <p class="schedule-time">
                    <mat-icon>access_time</mat-icon>
                    {{schedule.startTime}} - {{schedule.endTime}}
                  </p>
                  <p class="schedule-classroom">
                    <mat-icon>room</mat-icon>
                    Aula: {{schedule.classroom}}
                  </p>
                  <div class="attendance-status" *ngIf="getAttendanceStatus(schedule) as status">
                    <mat-chip [color]="status.color" selected>
                      <mat-icon>{{status.icon}}</mat-icon>
                      {{status.text}}
                    </mat-chip>
                    <small *ngIf="status.time">{{status.time}}</small>
                  </div>
                </div>
                <div class="schedule-actions">
                  <!-- Botón simple para registrar asistencia -->
                  <button mat-raised-button 
                          color="primary" 
                          (click)="registerAttendance(schedule)"
                          [disabled]="isAttendanceRegistered(schedule)"
                          class="register-btn">
                    <mat-icon>{{isAttendanceRegistered(schedule) ? 'check_circle' : 'how_to_reg'}}</mat-icon>
                    {{isAttendanceRegistered(schedule) ? 'Registrado' : 'Registrar Asistencia'}}
                  </button>
                  
                  <!-- Botones de entrada y salida (opcional) -->
                  <div class="detailed-actions" *ngIf="isAttendanceRegistered(schedule)">
                    <button mat-stroked-button 
                            color="accent" 
                            (click)="checkOut(schedule)"
                            [disabled]="hasCheckedOut(schedule)"
                            *ngIf="!hasCheckedOut(schedule)">
                      <mat-icon>logout</mat-icon>
                      Registrar Salida
                    </button>
                    
                    <div *ngIf="hasCheckedOut(schedule)" class="completed-status">
                      <mat-icon color="primary">check_circle</mat-icon>
                      <span>Clase Completada</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="actions-card">
            <mat-card-header>
              <mat-card-title>Acciones Rápidas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="action-buttons">
                <button mat-raised-button color="primary" routerLink="/teacher/attendance">
                  <mat-icon>assignment</mat-icon>
                  Ver Asistencias
                </button>
                <button mat-raised-button color="accent" routerLink="/teacher/schedule">
                  <mat-icon>schedule</mat-icon>
                  Ver Horarios
                </button>
                <button mat-raised-button color="warn" routerLink="/teacher/justifications">
                  <mat-icon>description</mat-icon>
                  Justificaciones
                </button>
                <button mat-button (click)="toggleDebug()">
                  <mat-icon>bug_report</mat-icon>
                  {{showDebug ? 'Ocultar' : 'Mostrar'}} Debug
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Horarios de la semana -->
          <mat-card class="weekly-schedule-card">
            <mat-card-header>
              <mat-card-title>Horarios de la Semana</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="weeklySchedules().length === 0" class="no-schedules">
                <mat-icon>schedule</mat-icon>
                <p>No tienes horarios asignados</p>
              </div>
              <div *ngFor="let daySchedules of weeklySchedules()" class="day-schedules">
                <h4>{{daySchedules.dayName}}</h4>
                <div *ngFor="let schedule of daySchedules.schedules" class="mini-schedule">
                  <span class="subject">{{schedule.subject}}</span>
                  <span class="time">{{schedule.startTime}} - {{schedule.endTime}}</span>
                  <span class="classroom">{{schedule.classroom}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </app-layout>
  `,
  styles: [
    `
    .teacher-dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .welcome-section h1 {
      margin: 0;
      color: #333;
    }

    .welcome-section p {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 16px;
    }

    .debug-section {
      margin-bottom: 20px;
    }

    .debug-section mat-card {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      height: 120px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-right: 16px;
    }

    .stat-icon.schedules { color: #2196F3; }
    .stat-icon.attendance { color: #4CAF50; }
    .stat-icon.pending { color: #FF9800; }

    .stat-info h2 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .schedule-card {
      grid-column: 1 / -1;
    }

    .actions-card,
    .weekly-schedule-card {
      min-height: 300px;
    }

    .no-schedules {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-schedules mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .schedule-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 16px;
      background: #fafafa;
    }

    .schedule-info {
      flex: 1;
    }

    .schedule-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
    }

    .schedule-time,
    .schedule-classroom {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }

    .schedule-time mat-icon,
    .schedule-classroom mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .attendance-status {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .attendance-status mat-chip {
      width: fit-content;
    }

    .attendance-status mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .attendance-status small {
      color: #666;
      font-size: 12px;
    }

    .schedule-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;
    }

    .register-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
    }

    .detailed-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detailed-actions button {
      width: 100%;
    }

    .completed-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4CAF50;
      font-weight: 500;
      justify-content: center;
      padding: 8px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .action-buttons button {
      width: 100%;
      height: 48px;
    }

    .action-buttons button mat-icon {
      margin-right: 8px;
    }

    .day-schedules {
      margin-bottom: 16px;
    }

    .day-schedules h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 16px;
    }

    .mini-schedule {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }

    .mini-schedule .subject {
      font-weight: 500;
      color: #333;
    }

    .mini-schedule .time {
      color: #666;
    }

    .mini-schedule .classroom {
      color: #888;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .schedule-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .schedule-actions {
        width: 100%;
        min-width: unset;
      }
    }

    .quick-actions {
      margin-bottom: 20px;
      text-align: center;
    }

    .register-all-btn {
      padding: 12px 24px;
      font-size: 16px;
    }

    .register-all-btn mat-icon {
      margin-right: 8px;
    }
  `,
  ],
})
export class TeacherDashboardComponent {
  private authService: AuthService = inject(AuthService);
  private teacherService: TeacherService = inject(TeacherService);
  private attendanceService: AttendanceService = inject(AttendanceService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  menuItems: MenuItem[] = [
    { label: "Dashboard", route: "/teacher/dashboard", icon: "dashboard" },
    { label: "Asistencias", route: "/teacher/attendance", icon: "assignment" },
    { label: "Justificaciones", route: "/teacher/justifications", icon: "description" },
    { label: "Horarios", route: "/teacher/schedule", icon: "schedule" },
  ]

  today = new Date()
  showDebug = false

  currentTeacher = computed(() => {
    const user = this.authService.currentUser()
    if (user && user.role === "teacher") {
      return this.teacherService.getTeacherById(user.id)
    }
    return null
  })

  totalSchedules = computed(() => this.currentTeacher()?.schedules.length || 0)

  monthlyAttendances = computed(() => {
    const teacher = this.currentTeacher()
    if (!teacher) return 0

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return this.attendanceService
      .getAttendancesByTeacher(teacher.id)
      .filter((a) => a.date >= startOfMonth && a.status === "present").length
  })

  pendingJustifications = computed(() => {
    const teacher = this.currentTeacher()
    if (!teacher) return 0

    return this.attendanceService.getJustificationsByTeacher(teacher.id).filter((j) => j.status === "pending").length
  })

  todaySchedules = computed(() => {
    const teacher = this.currentTeacher()
    if (!teacher) return []

    const todayDayOfWeek = this.today.getDay()
    return teacher.schedules.filter((s) => s.dayOfWeek === todayDayOfWeek)
  })

  weeklySchedules = computed(() => {
    const teacher = this.currentTeacher()
    if (!teacher) return []

    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const schedulesByDay: { dayName: string; schedules: Schedule[] }[] = []

    for (let i = 0; i < 7; i++) {
      const daySchedules = teacher.schedules.filter((s) => s.dayOfWeek === i)
      if (daySchedules.length > 0) {
        schedulesByDay.push({
          dayName: days[i],
          schedules: daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        })
      }
    }

    return schedulesByDay
  })



  trackByScheduleId(index: number, schedule: Schedule): string {
    return schedule.id
  }

  getDayName(dayOfWeek: number): string {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return days[dayOfWeek]
  }

  toggleDebug(): void {
    this.showDebug = !this.showDebug
  }

  debugAttendances(): void {
    this.attendanceService.debugAttendances()
    const teacher = this.currentTeacher()
    if (teacher) {
      console.log("Asistencias del profesor:", this.attendanceService.getAttendancesByTeacher(teacher.id))
    }
  }

  registerAttendance(schedule: Schedule): void {
    const teacher = this.currentTeacher()
    if (!teacher) {
      this.snackBar.open("❌ Error: No se pudo identificar al profesor", "Cerrar", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      })
      return
    }

    console.log("Registrando asistencia para:", {
      teacherId: teacher.id,
      scheduleId: schedule.id,
      subject: schedule.subject,
    })

    const success = this.attendanceService.markPresent(teacher.id, schedule.id)

    if (success) {
      this.snackBar.open(`✅ Asistencia registrada para ${schedule.subject}`, "Cerrar", {
        duration: 4000,
        panelClass: ["success-snackbar"],
      })
    } else {
      this.snackBar.open(`ℹ️ Ya tienes registrada la asistencia para ${schedule.subject}`, "Cerrar", {
        duration: 3000,
      })
    }
  }

  checkOut(schedule: Schedule): void {
    const teacher = this.currentTeacher()
    if (teacher) {
      const success = this.attendanceService.checkOut(teacher.id, schedule.id)
      if (success) {
        this.snackBar.open(`Salida registrada para ${schedule.subject}`, "Cerrar", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        })
      } else {
        this.snackBar.open("Error al registrar la salida", "Cerrar", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      }
    }
  }

  isAttendanceRegistered(schedule: Schedule): boolean {
    const teacher = this.currentTeacher()
    if (!teacher) return false

    return this.attendanceService.hasAttendanceToday(teacher.id, schedule.id)
  }

  hasCheckedOut(schedule: Schedule): boolean {
    const teacher = this.currentTeacher()
    if (!teacher) return false

    const status = this.attendanceService.getTodayAttendanceStatus(teacher.id, schedule.id)
    return status.hasCheckOut
  }

  getAttendanceStatus(schedule: Schedule): { text: string; color: string; icon: string; time?: string } | null {
    const teacher = this.currentTeacher()
    if (!teacher) return null

    const status = this.attendanceService.getTodayAttendanceStatus(teacher.id, schedule.id)

    if (!status.hasCheckIn) return null

    if (status.hasCheckOut) {
      return {
        text: "Completado",
        color: "primary",
        icon: "check_circle",
        time: `Salida: ${status.checkOutTime?.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
      }
    }

    return {
      text: "Presente",
      color: "accent",
      icon: "schedule",
      time: `Entrada: ${status.checkInTime?.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
    }
  }

  registerAllTodayClasses(): void {
    const teacher = this.currentTeacher()
    if (!teacher) return

    const todaySchedules = this.todaySchedules()
    let registered = 0

    todaySchedules.forEach((schedule) => {
      if (!this.isAttendanceRegistered(schedule)) {
        const success = this.attendanceService.markPresent(teacher.id, schedule.id)
        if (success) {
          registered++
        }
      }
    })

    if (registered > 0) {
      this.snackBar.open(`✅ ${registered} asistencia(s) registrada(s)`, "Cerrar", {
        duration: 3000,
        panelClass: ["success-snackbar"],
      })
    } else {
      this.snackBar.open("ℹ️ Ya tienes todas las asistencias registradas", "Cerrar", {
        duration: 3000,
      })
    }
  }
}
