import QRCode from 'qrcode'

export class QRCodeGenerator {
  /**
   * Generate QR code as data URL (base64 image)
   */
  static async generateDataURL(text: string, options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }): Promise<string> {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    }

    return await QRCode.toDataURL(text, defaultOptions)
  }

  /**
   * Generate QR code as canvas element
   */
  static async generateCanvas(
    text: string, 
    canvas: HTMLCanvasElement,
    options?: {
      width?: number
      margin?: number
      color?: {
        dark?: string
        light?: string
      }
    }
  ): Promise<void> {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    }

    await QRCode.toCanvas(canvas, text, defaultOptions)
  }

  /**
   * Download QR code as PNG image
   */
  static async downloadQRCode(
    text: string, 
    filename: string,
    options?: {
      width?: number
      margin?: number
      color?: {
        dark?: string
        light?: string
      }
    }
  ): Promise<void> {
    try {
      // Generate QR code as data URL
      const dataURL = await this.generateDataURL(text, options)
      
      // Create download link
      const link = document.createElement('a')
      link.href = dataURL
      link.download = filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      throw error
    }
  }

  /**
   * Generate QR code for student with formatted data
   */
  static generateStudentQRData(student: {
    id: string
    student_id: string
    name: string
    class: string
  }): string {
    return JSON.stringify({
      type: 'student_attendance',
      student_id: student.id,
      student_number: student.student_id,
      name: student.name,
      class: student.class,
      timestamp: Date.now()
    })
  }

  /**
   * Download student QR code with proper formatting
   */
  static async downloadStudentQRCode(student: {
    id: string
    student_id: string
    name: string
    class: string
  }): Promise<void> {
    const qrData = this.generateStudentQRData(student)
    const filename = `QR_${student.name.replace(/\s+/g, '_')}_${student.student_id}.png`
    
    await this.downloadQRCode(qrData, filename, {
      width: 400,
      margin: 3,
      color: {
        dark: '#1e40af', // Blue color
        light: '#ffffff'
      }
    })
  }

  /**
   * Generate QR code with student info overlay (for printing)
   */
  static async generateStudentCard(student: {
    id: string
    student_id: string
    name: string
    class: string
  }): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Set canvas size for student card
        canvas.width = 600
        canvas.height = 400

        // Fill background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add border
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 2
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

        // Add title
        ctx.fillStyle = '#1e40af'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('KARTU SISWA QR CODE', canvas.width / 2, 50)

        // Add student info
        ctx.fillStyle = '#374151'
        ctx.font = '18px Arial'
        ctx.textAlign = 'left'
        
        const infoY = 90
        ctx.fillText(`Nama: ${student.name}`, 50, infoY)
        ctx.fillText(`NIS: ${student.student_id}`, 50, infoY + 30)
        ctx.fillText(`Kelas: ${student.class}`, 50, infoY + 60)

        // Generate QR code
        const qrData = this.generateStudentQRData(student)
        const qrCanvas = document.createElement('canvas')
        
        await this.generateCanvas(qrData, qrCanvas, {
          width: 200,
          margin: 1,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        })

        // Draw QR code on main canvas
        const qrX = canvas.width - 250
        const qrY = 80
        ctx.drawImage(qrCanvas, qrX, qrY, 200, 200)

        // Add instructions
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Scan QR code di atas untuk absensi', canvas.width / 2, 350)

        // Convert to data URL
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Download student card with QR code
   */
  static async downloadStudentCard(student: {
    id: string
    student_id: string
    name: string
    class: string
  }): Promise<void> {
    try {
      const dataURL = await this.generateStudentCard(student)
      const filename = `Kartu_${student.name.replace(/\s+/g, '_')}_${student.student_id}.png`
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading student card:', error)
      throw error
    }
  }
}
