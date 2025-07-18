export interface Student {
  id: string
  student_id: string
  name: string
  class: string
  qr_code: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  time: string
  status: 'present' | 'late' | 'absent'
  created_at: string
  student?: Student
}

export interface ClassInfo {
  id: string
  name: string
  teacher: string
  schedule: string
  created_at: string
}

export interface AttendanceStats {
  total_students: number
  present_today: number
  late_today: number
  absent_today: number
  attendance_rate: number
}

export interface ScanSession {
  id: string
  date: string
  start_time: string
  end_time?: string
  class_id: string
  total_scanned: number
  status: 'active' | 'completed'
}

export type AttendanceStatus = 'present' | 'late' | 'absent'
