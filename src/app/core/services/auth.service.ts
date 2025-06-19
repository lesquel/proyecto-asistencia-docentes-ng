import { Injectable, signal, computed, inject } from "@angular/core"
import { Router } from "@angular/router"
import { isPlatformBrowser } from "@angular/common"
import { PLATFORM_ID, Inject } from "@angular/core"
import type { User, Teacher, Admin } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null)

  currentUser = this.currentUserSignal.asReadonly()
  isAuthenticated = computed(() => !!this.currentUserSignal())
  isAdmin = computed(() => this.currentUserSignal()?.role === "admin")
  isTeacher = computed(() => this.currentUserSignal()?.role === "teacher")

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage()
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          this.currentUserSignal.set(user)
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error)
          localStorage.removeItem("currentUser")
        }
      }
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        const users = this.getMockUsers()
        const user = users.find((u) => u.email === email)

        if (user && this.validatePassword(password)) {
          this.currentUserSignal.set(user)

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("currentUser", JSON.stringify(user))
          }

          // Redirect based on role
          if (user.role === "admin") {
            this.router.navigate(["/admin/dashboard"])
          } else {
            this.router.navigate(["/teacher/dashboard"])
          }

          resolve(true)
        } else {
          resolve(false)
        }
      }, 1000)
    })
  }

  logout(): void {
    this.currentUserSignal.set(null)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("currentUser")
    }
    this.router.navigate(["/auth/login"])
  }

  private validatePassword(password: string): boolean {
    return password.length >= 6
  }

  private getMockUsers(): User[] {
    return [
      {
        id: "1",
        email: "admin@school.com",
        name: "Administrator",
        role: "admin",
        createdAt: new Date(),
      } as Admin,
      {
        id: "2",
        email: "teacher1@school.com",
        name: "María García",
        role: "teacher",
        employeeId: "T001",
        department: "Matemáticas",
        phone: "555-0101",
        schedules: [],
        createdAt: new Date(),
      } as Teacher,
      {
        id: "3",
        email: "teacher2@school.com",
        name: "Juan Pérez",
        role: "teacher",
        employeeId: "T002",
        department: "Historia",
        phone: "555-0102",
        schedules: [],
        createdAt: new Date(),
      } as Teacher,
    ]
  }
}
