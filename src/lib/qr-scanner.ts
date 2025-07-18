import QrScanner from 'qr-scanner'

export interface ScanResult {
  data: string
  timestamp: number
}

export class QRScannerService {
  private scanner: QrScanner | null = null
  private videoElement: HTMLVideoElement | null = null

  async initializeScanner(
    videoElement: HTMLVideoElement,
    onScan: (result: ScanResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.videoElement = videoElement
      
      this.scanner = new QrScanner(
        videoElement,
        (result) => {
          onScan({
            data: result.data,
            timestamp: Date.now()
          })
        },
        {
          onDecodeError: (error) => {
            console.log('QR Decode Error:', error)
            // Don't call onError for decode errors as they're expected
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment' // Use back camera on mobile
        }
      )

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
        throw new Error('No camera available')
      }

      await this.scanner.start()
    } catch (error) {
      console.error('Scanner initialization failed:', error)
      if (onError) {
        onError(error as Error)
      }
      throw error
    }
  }

  async stopScanner(): Promise<void> {
    if (this.scanner) {
      this.scanner.stop()
      this.scanner.destroy()
      this.scanner = null
    }
  }

  async toggleFlash(): Promise<void> {
    if (this.scanner) {
      await this.scanner.toggleFlash()
    }
  }

  async hasFlash(): Promise<boolean> {
    if (this.scanner) {
      return await this.scanner.hasFlash()
    }
    return false
  }

  static async getCameras(): Promise<QrScanner.Camera[]> {
    return await QrScanner.listCameras()
  }

  async setCamera(cameraId: string): Promise<void> {
    if (this.scanner) {
      await this.scanner.setCamera(cameraId)
    }
  }

  // Generate QR code for student
  static generateStudentQRCode(studentId: string): string {
    const qrData = {
      type: 'student_attendance',
      student_id: studentId,
      timestamp: Date.now()
    }
    return JSON.stringify(qrData)
  }

  // Validate QR code data
  static validateQRCode(qrData: string): { valid: boolean; studentId?: string; error?: string } {
    try {
      const parsed = JSON.parse(qrData)
      
      if (parsed.type !== 'student_attendance') {
        return { valid: false, error: 'Invalid QR code type' }
      }
      
      if (!parsed.student_id) {
        return { valid: false, error: 'Student ID not found in QR code' }
      }
      
      return { valid: true, studentId: parsed.student_id }
    } catch (error) {
      return { valid: false, error: 'Invalid QR code format' }
    }
  }
}
