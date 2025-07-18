import { supabase } from '@/lib/supabase'
import { Student, AttendanceRecord, AttendanceStats } from '@/types'
import { format } from 'date-fns'

export class AttendanceService {
  // Student operations
  static async getAllStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }

  static async getStudentByQRCode(qrCode: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('qr_code', qrCode)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Attendance operations
  static async getTodayAttendance(date?: string): Promise<AttendanceRecord[]> {
    const today = date || format(new Date(), 'yyyy-MM-dd')
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        student:students(*)
      `)
      .eq('date', today)
      .order('time', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async markAttendance(
    studentId: string,
    status: 'present' | 'late' | 'absent' = 'present'
  ): Promise<AttendanceRecord> {
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    const time = format(now, 'HH:mm:ss')

    // Check if attendance already exists for today
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing attendance
      const { data, error } = await supabase
        .from('attendance')
        .update({ 
          status, 
          time,
        })
        .eq('id', existing.id)
        .select(`
          *,
          student:students(*)
        `)
        .single()
      
      if (error) throw error
      return data
    } else {
      // Create new attendance record
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          student_id: studentId,
          date: today,
          time,
          status,
        }])
        .select(`
          *,
          student:students(*)
        `)
        .single()
      
      if (error) throw error
      return data
    }
  }

  static async getAttendanceByDateRange(
    startDate: string,
    endDate: string,
    studentId?: string
  ): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:students(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async getAttendanceStats(date?: string): Promise<AttendanceStats> {
    const today = date || format(new Date(), 'yyyy-MM-dd')

    // Get total students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // Get today's attendance
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today)

    const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0
    const lateToday = todayAttendance?.filter(a => a.status === 'late').length || 0
    const absentToday = (totalStudents || 0) - presentToday - lateToday

    const attendanceRate = totalStudents ? 
      ((presentToday + lateToday) / totalStudents) * 100 : 0

    return {
      total_students: totalStudents || 0,
      present_today: presentToday,
      late_today: lateToday,
      absent_today: absentToday,
      attendance_rate: Math.round(attendanceRate * 100) / 100
    }
  }

  // Generate QR code for student
  static generateQRCodeForStudent(studentId: string): string {
    return JSON.stringify({
      type: 'student_attendance',
      student_id: studentId,
      timestamp: Date.now()
    })
  }

  // Validate attendance time (e.g., late if after 8 AM)
  static determineAttendanceStatus(time: string, cutoffTime: string = '08:00:00'): 'present' | 'late' {
    return time <= cutoffTime ? 'present' : 'late'
  }
}
