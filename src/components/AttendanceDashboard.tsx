'use client'

import { useEffect, useState } from 'react'
import { AttendanceStats, AttendanceRecord } from '@/types'
import { AttendanceService } from '@/services/attendance'
import { useAttendanceStore } from '@/store/attendance'
import { Users, UserCheck, Clock, UserX, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

interface AttendanceDashboardProps {
  selectedDate?: string
}

export default function AttendanceDashboard({ selectedDate }: AttendanceDashboardProps) {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const { todayAttendance, stats: storeStats } = useAttendanceStore()

  useEffect(() => {
    loadDashboardData()
  }, [selectedDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats
      const statsData = await AttendanceService.getAttendanceStats(selectedDate)
      setStats(statsData)
      
      // Load recent attendance
      const attendanceData = await AttendanceService.getTodayAttendance(selectedDate)
      setRecentAttendance(attendanceData.slice(0, 10)) // Last 10 entries
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayDate = selectedDate ? new Date(selectedDate) : new Date()
  const isToday = format(displayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Absensi
        </h2>
        <p className="text-gray-600">
          {isToday ? 'Hari ini' : format(displayDate, 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Siswa"
          value={stats?.total_students || 0}
          icon={<Users className="w-6 h-6" />}
          color="#3B82F6"
        />
        
        <StatCard
          title="Hadir"
          value={stats?.present_today || 0}
          icon={<UserCheck className="w-6 h-6" />}
          color="#10B981"
          subtitle={`${((stats?.present_today || 0) / (stats?.total_students || 1) * 100).toFixed(1)}%`}
        />
        
        <StatCard
          title="Terlambat"
          value={stats?.late_today || 0}
          icon={<Clock className="w-6 h-6" />}
          color="#F59E0B"
          subtitle={`${((stats?.late_today || 0) / (stats?.total_students || 1) * 100).toFixed(1)}%`}
        />
        
        <StatCard
          title="Tidak Hadir"
          value={stats?.absent_today || 0}
          icon={<UserX className="w-6 h-6" />}
          color="#EF4444"
          subtitle={`${((stats?.absent_today || 0) / (stats?.total_students || 1) * 100).toFixed(1)}%`}
        />
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tingkat Kehadiran</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Persentase Kehadiran</span>
            <span className="text-lg font-bold text-gray-900">
              {stats?.attendance_rate?.toFixed(1) || 0}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats?.attendance_rate || 0}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Absensi Terbaru {isToday ? 'Hari Ini' : format(displayDate, 'dd/MM/yyyy')}
        </h3>
        
        {recentAttendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada absensi {isToday ? 'hari ini' : 'pada tanggal ini'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAttendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.student?.name || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.student?.class} • {record.student?.student_id}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    record.status === 'present' ? 'text-green-600' :
                    record.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {record.status === 'present' ? 'Hadir' :
                     record.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {record.time.substring(0, 5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
