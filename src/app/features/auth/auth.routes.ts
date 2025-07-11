import type { Routes } from "@angular/router"
import { LoginComponent } from "./login/login.component"

export const authRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
]
