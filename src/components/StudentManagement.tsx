'use client'

import { useState, useEffect } from 'react'
import { Student } from '@/types'
import { AttendanceService } from '@/services/attendance'
import { useAttendanceStore } from '@/store/attendance'
import { QRScannerService } from '@/lib/qr-scanner'
import { QRCodeGenerator } from '@/lib/qr-generator'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  QrCode, 
  Search, 
  Filter,
  Download,
  Upload,
  CreditCard
} from 'lucide-react'

interface StudentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onSave: (student: Partial<Student>) => void
}

function StudentModal({ student, isOpen, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    student_id: '',
    class: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (student) {
      setFormData(student)
    } else {
      setFormData({
        name: '',
        student_id: '',
        class: '',
        email: '',
        phone: '',
      })
    }
  }, [student, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {student ? 'Edit Siswa' : 'Tambah Siswa Baru'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Siswa
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama siswa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIS/ID Siswa
            </label>
            <input
              type="text"
              required
              value={formData.student_id || ''}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan NIS/ID siswa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <input
              type="text"
              required
              value={formData.class || ''}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 12 IPA 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telepon (Opsional)
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {student ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const { students: storeStudents, setStudents: setStoreStudents } = useAttendanceStore()

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedClass])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await AttendanceService.getAllStudents()
      setStudents(data)
      setStoreStudents(data)
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass)
    }

    setFilteredStudents(filtered)
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setModalOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setModalOpen(true)
  }

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (editingStudent) {
        // Update existing student
        await AttendanceService.updateStudent(editingStudent.id, studentData)
      } else {
        // Create new student - generate QR code data
        const qrData = QRCodeGenerator.generateStudentQRData({
          id: studentData.student_id!, // Use student_id as temporary ID for QR generation
          student_id: studentData.student_id!,
          name: studentData.name!,
          class: studentData.class!
        })
        
        const newStudentData = {
          ...studentData,
          qr_code: qrData
        }
        
        await AttendanceService.createStudent(newStudentData as Omit<Student, 'id' | 'created_at' | 'updated_at'>)
      }
      loadStudents()
      toast.success(editingStudent ? 'Siswa berhasil diupdate!' : 'Siswa berhasil ditambahkan!')
    } catch (error) {
      console.error('Failed to save student:', error)
      toast.error('Gagal menyimpan data siswa')
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        await AttendanceService.deleteStudent(studentId)
        loadStudents()
      } catch (error) {
        console.error('Failed to delete student:', error)
      }
    }
  }

  const generateQRCode = async (student: Student) => {
    try {
      await QRCodeGenerator.downloadStudentQRCode(student)
      toast.success(`QR Code untuk ${student.name} berhasil didownload!`)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast.error('Gagal generate QR Code')
    }
  }

  const generateStudentCard = async (student: Student) => {
    try {
      await QRCodeGenerator.downloadStudentCard(student)
      toast.success(`Kartu siswa untuk ${student.name} berhasil didownload!`)
    } catch (error) {
      console.error('Failed to generate student card:', error)
      toast.error('Gagal generate kartu siswa')
    }
  }

  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Data Siswa ({filteredStudents.length})
          </h2>
        </div>
        
        <button
          onClick={handleAddStudent}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Semua Kelas</option>
            {uniqueClasses.map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {searchTerm || selectedClass ? 'Tidak ada siswa yang cocok dengan filter' : 'Belum ada data siswa'}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">
                    {student.student_id} • {student.class}
                  </p>
                  {student.email && (
                    <p className="text-xs text-gray-500">{student.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => generateQRCode(student)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Download QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => generateStudentCard(student)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Download Kartu Siswa"
                >
                  <CreditCard className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleEditStudent(student)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <StudentModal
        student={editingStudent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  )
}
