'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import QRScanner from '@/components/QRScanner'
import AttendanceDashboard from '@/components/AttendanceDashboard'
import StudentManagement from '@/components/StudentManagement'
import { 
  QrCode, 
  BarChart3, 
  Users, 
  Menu,
  X,
  Calendar
} from 'lucide-react'

type ActiveTab = 'scanner' | 'dashboard' | 'students'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'scanner' as ActiveTab, label: 'Scanner QR', icon: QrCode },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'students' as ActiveTab, label: 'Data Siswa', icon: Users },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Absensi Siswa
              </h1>
              <p className="text-gray-600 mb-6">
                Scan QR code siswa untuk mencatat kehadiran
              </p>
              
              <QRScanner 
                className="w-full h-96 md:h-[500px]"
                onScan={(studentId) => {
                  console.log('Student scanned:', studentId)
                }}
                onError={(error) => {
                  console.error('Scanner error:', error)
                }}
              />
            </div>
          </div>
        )
      
      case 'dashboard':
        return <AttendanceDashboard />
      
      case 'students':
        return <StudentManagement />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Sistem Absensi
              </h1>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  )
}
