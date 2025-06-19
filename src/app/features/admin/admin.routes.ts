import type { Routes } from "@angular/router"
import { AdminDashboardComponent } from "./dashboard/admin-dashboard.component"
import { TeacherManagementComponent } from "./teachers/teacher-management.component"

export const adminRoutes: Routes = [
  {
    path: "dashboard",
    component: AdminDashboardComponent
  },
  {
    path: "teachers",
    component: TeacherManagementComponent
  },
  // {
  //   path: "schedules",
  //   component: ScheduleManagementComponent
  // },
  // {
  //   path: "attendance",
  //   component: AttendanceManagementComponent
  // },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
]
