import { Injectable, signal } from "@angular/core"
import type { Teacher, Schedule } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class TeacherService {
  private teachersSignal = signal<Teacher[]>([])

  teachers = this.teachersSignal.asReadonly()

  constructor() {
    this.loadTeachers()
  }

  private loadTeachers(): void {
    const stored = localStorage.getItem("teachers")
    if (stored) {
      try {
        const teachers = JSON.parse(stored)
        this.teachersSignal.set(teachers)
      } catch (error) {
        console.error("Error loading teachers:", error)
        this.initializeMockData()
      }
    } else {
      this.initializeMockData()
    }
  }

  private initializeMockData(): void {
    const mockTeachers: Teacher[] = [
      {
        id: "2",
        email: "teacher1@school.com",
        name: "María García",
        role: "teacher",
        employeeId: "T001",
        department: "Matemáticas",
        phone: "555-0101",
        schedules: [
          {
            id: "s1",
            teacherId: "2",
            dayOfWeek: 1,
            startTime: "08:00",
            endTime: "10:00",
            subject: "Álgebra",
            classroom: "A101",
          },
          {
            id: "s2",
            teacherId: "2",
            dayOfWeek: 3,
            startTime: "10:00",
            endTime: "12:00",
            subject: "Geometría",
            classroom: "A102",
          },
        ],
        createdAt: new Date(),
      },
      {
        id: "3",
        email: "teacher2@school.com",
        name: "Juan Pérez",
        role: "teacher",
        employeeId: "T002",
        department: "Historia",
        phone: "555-0102",
        schedules: [
          {
            id: "s3",
            teacherId: "3",
            dayOfWeek: 2,
            startTime: "14:00",
            endTime: "16:00",
            subject: "Historia Universal",
            classroom: "B201",
          },
        ],
        createdAt: new Date(),
      },
    ]

    this.teachersSignal.set(mockTeachers)
    this.saveTeachers()
  }

  private saveTeachers(): void {
    localStorage.setItem("teachers", JSON.stringify(this.teachersSignal()))
  }

  addTeacher(teacher: Omit<Teacher, "id" | "createdAt">): void {
    const newTeacher: Teacher = {
      ...teacher,
      id: this.generateId(),
      createdAt: new Date(),
    }

    const currentTeachers = this.teachersSignal()
    this.teachersSignal.set([...currentTeachers, newTeacher])
    this.saveTeachers()
  }

  updateTeacher(id: string, updates: Partial<Teacher>): void {
    const currentTeachers = this.teachersSignal()
    const updatedTeachers = currentTeachers.map((teacher) => (teacher.id === id ? { ...teacher, ...updates } : teacher))
    this.teachersSignal.set(updatedTeachers)
    this.saveTeachers()
  }

  deleteTeacher(id: string): void {
    const currentTeachers = this.teachersSignal()
    const filteredTeachers = currentTeachers.filter((teacher) => teacher.id !== id)
    this.teachersSignal.set(filteredTeachers)
    this.saveTeachers()
  }

  getTeacherById(id: string): Teacher | undefined {
    return this.teachersSignal().find((teacher) => teacher.id === id)
  }

  addScheduleToTeacher(teacherId: string, schedule: Omit<Schedule, "id" | "teacherId">): void {
    const newSchedule: Schedule = {
      ...schedule,
      id: this.generateId(),
      teacherId,
    }

    const currentTeachers = this.teachersSignal()
    const updatedTeachers = currentTeachers.map((teacher) =>
      teacher.id === teacherId ? { ...teacher, schedules: [...teacher.schedules, newSchedule] } : teacher,
    )

    this.teachersSignal.set(updatedTeachers)
    this.saveTeachers()
  }

  removeScheduleFromTeacher(teacherId: string, scheduleId: string): void {
    const currentTeachers = this.teachersSignal()
    const updatedTeachers = currentTeachers.map((teacher) =>
      teacher.id === teacherId
        ? { ...teacher, schedules: teacher.schedules.filter((s) => s.id !== scheduleId) }
        : teacher,
    )

    this.teachersSignal.set(updatedTeachers)
    this.saveTeachers()
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
}
