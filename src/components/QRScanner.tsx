'use client'

import { useEffect, useRef, useState } from 'react'
import { QRScannerService, ScanResult } from '@/lib/qr-scanner'
import { Camera, CameraOff, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react'
import { AttendanceService } from '@/services/attendance'
import { useAttendanceStore } from '@/store/attendance'
import { toast } from 'react-hot-toast'

interface QRScannerProps {
  onScan?: (studentId: string) => void
  onError?: (error: string) => void
  className?: string
}

export default function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QRScannerService | null>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [scanCooldown, setScanCooldown] = useState(false)

  const { addAttendanceRecord, setScannerActive } = useAttendanceStore()

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    if (!videoRef.current || isScanning) return

    try {
      setError(null)
      scannerRef.current = new QRScannerService()
      
      await scannerRef.current.initializeScanner(
        videoRef.current,
        handleScanResult,
        handleScanError
      )

      // Check if flash is available
      const flashAvailable = await scannerRef.current.hasFlash()
      setHasFlash(flashAvailable)
      
      setIsScanning(true)
      setScannerActive(true)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Scanner start error:', err)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stopScanner()
      scannerRef.current = null
    }
    setIsScanning(false)
    setScannerActive(false)
    setFlashEnabled(false)
  }

  const handleScanResult = async (result: ScanResult) => {
    // Prevent rapid scanning of the same code
    if (scanCooldown || result.data === lastScan) return
    
    setScanCooldown(true)
    setLastScan(result.data)
    
    try {
      // Validate QR code
      const validation = QRScannerService.validateQRCode(result.data)
      
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid QR code')
        return
      }

      // Get student data
      const student = await AttendanceService.getStudentById(validation.studentId!)
      
      if (!student) {
        toast.error('Student not found')
        return
      }

      // Mark attendance
      const attendanceRecord = await AttendanceService.markAttendance(
        student.id,
        AttendanceService.determineAttendanceStatus(
          new Date().toTimeString().split(' ')[0]
        )
      )

      // Update store
      addAttendanceRecord(attendanceRecord)
      
      // Success feedback
      toast.success(`✅ ${student.name} - ${attendanceRecord.status.toUpperCase()}`)
      onScan?.(student.id)

      // Vibration feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(200)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process QR code'
      toast.error(errorMessage)
      onError?.(errorMessage)
      console.error('Scan processing error:', err)
    } finally {
      // Reset cooldown after 2 seconds
      setTimeout(() => {
        setScanCooldown(false)
        setLastScan(null)
      }, 2000)
    }
  }

  const handleScanError = (error: Error) => {
    console.error('QR Scanner error:', error)
    // Don't show decode errors to user as they're normal
  }

  const toggleFlash = async () => {
    if (scannerRef.current && hasFlash) {
      try {
        await scannerRef.current.toggleFlash()
        setFlashEnabled(!flashEnabled)
      } catch (err) {
        console.error('Flash toggle error:', err)
      }
    }
  }

  const restartScanner = async () => {
    await stopScanner()
    setTimeout(startScanner, 500)
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white">
            <h3 className="font-semibold">Scan QR Code</h3>
            <p className="text-sm opacity-75">
              {isScanning ? 'Camera active' : 'Camera off'}
            </p>
          </div>
          
          {hasFlash && isScanning && (
            <button
              onClick={toggleFlash}
              className="p-2 rounded-full bg-black/50 text-white"
              aria-label="Toggle flashlight"
            >
              {flashEnabled ? (
                <FlashlightOff className="w-6 h-6" />
              ) : (
                <Flashlight className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Scanning Area Overlay */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Scanner Frame */}
            <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              {isScanning && !scanCooldown && (
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
              )}
              
              {/* Cooldown indicator */}
              {scanCooldown && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl">✅</div>
                    <div className="text-sm">Scanned!</div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-white text-center mt-4 text-sm">
              {scanCooldown 
                ? 'Processing...' 
                : 'Align QR code within the frame'
              }
            </p>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center space-x-4">
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Start Scanner</span>
              </button>
            ) : (
              <>
                <button
                  onClick={stopScanner}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CameraOff className="w-5 h-5" />
                  <span>Stop</span>
                </button>
                
                <button
                  onClick={restartScanner}
                  className="flex items-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Restart</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h3 className="font-semibold mb-2">Camera Error</h3>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
