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
  templateUrl: './teacher-dashboard.component.html',
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
