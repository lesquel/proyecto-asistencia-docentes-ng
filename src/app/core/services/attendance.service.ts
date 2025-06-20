import { Injectable, signal } from "@angular/core"
import type { Attendance, AttendanceJustification } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AttendanceService {
  private attendancesSignal = signal<Attendance[]>([])
  private justificationsSignal = signal<AttendanceJustification[]>([])

  attendances = this.attendancesSignal.asReadonly()
  justifications = this.justificationsSignal.asReadonly()

  constructor() {
    this.loadData()
  }

  private loadData(): void {
    if (typeof localStorage === "undefined") {
      return
    }

    // Load attendances
    const storedAttendances = localStorage.getItem("attendances")
    if (storedAttendances) {
      try {
        const attendances = JSON.parse(storedAttendances).map((a: any) => ({
          ...a,
          date: new Date(a.date),
          checkIn: a.checkIn ? new Date(a.checkIn) : undefined,
          checkOut: a.checkOut ? new Date(a.checkOut) : undefined,
        }))
        this.attendancesSignal.set(attendances)
      } catch (error) {
        console.error("Error loading attendances:", error)
      }
    }

    // Load justifications
    const storedJustifications = localStorage.getItem("justifications")
    if (storedJustifications) {
      try {
        const justifications = JSON.parse(storedJustifications).map((j: any) => ({
          ...j,
          date: new Date(j.date),
          createdAt: new Date(j.createdAt),
          reviewedAt: j.reviewedAt ? new Date(j.reviewedAt) : undefined,
        }))
        this.justificationsSignal.set(justifications)
      } catch (error) {
        console.error("Error loading justifications:", error)
      }
    }
  }

  private saveAttendances(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("attendances", JSON.stringify(this.attendancesSignal()))
    }
  }

  private saveJustifications(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("justifications", JSON.stringify(this.justificationsSignal()))
    }
  }

  checkIn(teacherId: string, scheduleId: string): boolean {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Verificar si ya existe una asistencia para hoy
      const existingAttendance = this.attendancesSignal().find(
        (a) => a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime(),
      )

      if (existingAttendance && existingAttendance.checkIn) {
        console.log("Ya existe asistencia registrada para hoy")
        return false // Ya registrado
      }

      if (existingAttendance) {
        // Actualizar asistencia existente
        const updatedAttendances = this.attendancesSignal().map((a) =>
          a.id === existingAttendance.id ? { ...a, checkIn: new Date(), status: "present" as const } : a,
        )
        this.attendancesSignal.set(updatedAttendances)
      } else {
        // Crear nueva asistencia
        const newAttendance: Attendance = {
          id: this.generateId(),
          teacherId,
          scheduleId,
          date: today,
          checkIn: new Date(),
          status: "present",
        }

        this.attendancesSignal.set([...this.attendancesSignal(), newAttendance])
      }

      this.saveAttendances()
      console.log("Asistencia registrada exitosamente")
      return true
    } catch (error) {
      console.error("Error al registrar asistencia:", error)
      return false
    }
  }

  checkOut(teacherId: string, scheduleId: string): boolean {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const attendance = this.attendancesSignal().find(
        (a) => a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime(),
      )

      if (attendance && attendance.checkIn) {
        const updatedAttendances = this.attendancesSignal().map((a) =>
          a.id === attendance.id ? { ...a, checkOut: new Date() } : a,
        )
        this.attendancesSignal.set(updatedAttendances)
        this.saveAttendances()
        console.log("Salida registrada exitosamente")
        return true
      }

      console.log("No se puede registrar salida sin entrada")
      return false
    } catch (error) {
      console.error("Error al registrar salida:", error)
      return false
    }
  }

  // Método específico para registrar asistencia simple (solo marcar presente)
  markPresent(teacherId: string, scheduleId: string): boolean {
    return this.checkIn(teacherId, scheduleId)
  }

  // Verificar si ya se registró asistencia hoy
  hasAttendanceToday(teacherId: string, scheduleId: string): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = this.attendancesSignal().find(
      (a) =>
        a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime() && a.checkIn,
    )

    return !!attendance
  }

  // Obtener estado de asistencia para hoy
  getTodayAttendanceStatus(
    teacherId: string,
    scheduleId: string,
  ): {
    hasCheckIn: boolean
    hasCheckOut: boolean
    checkInTime?: Date
    checkOutTime?: Date
  } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = this.attendancesSignal().find(
      (a) => a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime(),
    )

    if (!attendance) {
      return { hasCheckIn: false, hasCheckOut: false }
    }

    return {
      hasCheckIn: !!attendance.checkIn,
      hasCheckOut: !!attendance.checkOut,
      checkInTime: attendance.checkIn,
      checkOutTime: attendance.checkOut,
    }
  }

  getAttendancesByTeacher(teacherId: string): Attendance[] {
    return this.attendancesSignal().filter((a) => a.teacherId === teacherId)
  }

  getAttendancesByDate(date: Date): Attendance[] {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    return this.attendancesSignal().filter((a) => a.date.getTime() === targetDate.getTime())
  }

  submitJustification(justification: Omit<AttendanceJustification, "id" | "createdAt" | "status">): void {
    const newJustification: AttendanceJustification = {
      ...justification,
      id: this.generateId(),
      status: "pending",
      createdAt: new Date(),
    }

    this.justificationsSignal.set([...this.justificationsSignal(), newJustification])
    this.saveJustifications()
  }

  reviewJustification(id: string, status: "approved" | "rejected", reviewedBy: string): void {
    const updatedJustifications = this.justificationsSignal().map((j) =>
      j.id === id ? { ...j, status, reviewedBy, reviewedAt: new Date() } : j,
    )

    this.justificationsSignal.set(updatedJustifications)
    this.saveJustifications()
  }

  getJustificationsByTeacher(teacherId: string): AttendanceJustification[] {
    return this.justificationsSignal().filter((j) => j.teacherId === teacherId)
  }

  getPendingJustifications(): AttendanceJustification[] {
    return this.justificationsSignal().filter((j) => j.status === "pending")
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Método para debug - ver todas las asistencias
  debugAttendances(): void {
    console.log("Todas las asistencias:", this.attendancesSignal())
  }
}
