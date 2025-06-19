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
    localStorage.setItem("attendances", JSON.stringify(this.attendancesSignal()))
  }

  private saveJustifications(): void {
    localStorage.setItem("justifications", JSON.stringify(this.justificationsSignal()))
  }

  checkIn(teacherId: string, scheduleId: string): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = this.attendancesSignal().find(
      (a) => a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime(),
    )

    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendances = this.attendancesSignal().map((a) =>
        a.id === existingAttendance.id ? { ...a, checkIn: new Date(), status: "present" as const } : a,
      )
      this.attendancesSignal.set(updatedAttendances)
    } else {
      // Create new attendance
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
  }

  checkOut(teacherId: string, scheduleId: string): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = this.attendancesSignal().find(
      (a) => a.teacherId === teacherId && a.scheduleId === scheduleId && a.date.getTime() === today.getTime(),
    )

    if (attendance) {
      const updatedAttendances = this.attendancesSignal().map((a) =>
        a.id === attendance.id ? { ...a, checkOut: new Date() } : a,
      )
      this.attendancesSignal.set(updatedAttendances)
      this.saveAttendances()
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
}
