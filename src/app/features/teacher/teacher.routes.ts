import type { Routes } from "@angular/router"

export const teacherRoutes: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./dashboard/teacher-dashboard.component").then((m) => m.TeacherDashboardComponent),
  },
  {
    path: "attendance",
    loadComponent: () => import("./attendance/teacher-attendance.component").then((m) => m.TeacherAttendanceComponent),
  },
  {
    path: "justifications",
    loadComponent: () =>
      import("./justifications/teacher-justifications.component").then((m) => m.TeacherJustificationsComponent),
  },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
]
