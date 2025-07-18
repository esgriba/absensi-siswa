import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AttendanceRecord, Student, AttendanceStats } from '@/types'

interface AttendanceStore {
  // State
  students: Student[]
  todayAttendance: AttendanceRecord[]
  stats: AttendanceStats | null
  scannerActive: boolean
  selectedClass: string | null
  
  // Actions
  setStudents: (students: Student[]) => void
  addStudent: (student: Student) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  removeStudent: (id: string) => void
  
  setTodayAttendance: (attendance: AttendanceRecord[]) => void
  addAttendanceRecord: (record: AttendanceRecord) => void
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void
  
  setStats: (stats: AttendanceStats) => void
  setScannerActive: (active: boolean) => void
  setSelectedClass: (classId: string | null) => void
  
  // Computed getters
  getStudentById: (id: string) => Student | undefined
  getAttendanceByStudentId: (studentId: string) => AttendanceRecord | undefined
  getStudentsByClass: (className: string) => Student[]
  
  // Reset
  reset: () => void
}

const initialState = {
  students: [],
  todayAttendance: [],
  stats: null,
  scannerActive: false,
  selectedClass: null,
}

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Actions
        setStudents: (students) => set({ students }),
        
        addStudent: (student) => 
          set((state) => ({ 
            students: [...state.students, student] 
          })),
        
        updateStudent: (id, updates) =>
          set((state) => ({
            students: state.students.map((student) =>
              student.id === id ? { ...student, ...updates } : student
            ),
          })),
        
        removeStudent: (id) =>
          set((state) => ({
            students: state.students.filter((student) => student.id !== id),
          })),
        
        setTodayAttendance: (attendance) => set({ todayAttendance: attendance }),
        
        addAttendanceRecord: (record) =>
          set((state) => {
            // Check if student already has attendance today
            const existingIndex = state.todayAttendance.findIndex(
              (att) => att.student_id === record.student_id
            )
            
            if (existingIndex >= 0) {
              // Update existing record
              const updated = [...state.todayAttendance]
              updated[existingIndex] = record
              return { todayAttendance: updated }
            } else {
              // Add new record
              return { todayAttendance: [...state.todayAttendance, record] }
            }
          }),
        
        updateAttendanceRecord: (id, updates) =>
          set((state) => ({
            todayAttendance: state.todayAttendance.map((record) =>
              record.id === id ? { ...record, ...updates } : record
            ),
          })),
        
        setStats: (stats) => set({ stats }),
        setScannerActive: (active) => set({ scannerActive: active }),
        setSelectedClass: (classId) => set({ selectedClass: classId }),
        
        // Computed getters
        getStudentById: (id) => {
          const { students } = get()
          return students.find((student) => student.id === id)
        },
        
        getAttendanceByStudentId: (studentId) => {
          const { todayAttendance } = get()
          return todayAttendance.find((record) => record.student_id === studentId)
        },
        
        getStudentsByClass: (className) => {
          const { students } = get()
          return students.filter((student) => student.class === className)
        },
        
        reset: () => set(initialState),
      }),
      {
        name: 'attendance-store',
        partialize: (state) => ({
          selectedClass: state.selectedClass,
        }),
      }
    ),
    {
      name: 'attendance-store',
    }
  )
)
