export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "teacher"
  createdAt: Date
}

export interface Teacher extends User {
  role: "teacher"
  employeeId: string
  department: string
  phone?: string
  schedules: Schedule[]
}

export interface Admin extends User {
  role: "admin"
}

export interface Schedule {
  id: string
  teacherId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string
  subject: string
  classroom: string
}

export interface Attendance {
  id: string
  teacherId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  status: "present" | "absent" | "late" | "justified"
  justification?: string
  scheduleId: string
}

export interface AttendanceJustification {
  id: string
  teacherId: string
  date: Date
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  reviewedBy?: string
  reviewedAt?: Date
}
