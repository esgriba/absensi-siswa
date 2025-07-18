# Sistem Absensi Siswa dengan QR Code

Aplikasi web modern untuk mengelola absensi siswa menggunakan teknologi QR code scanning. Dibangun dengan Next.js, TypeScript, dan Supabase.

## 🚀 Fitur Utama

- **QR Code Scanner**: Scan QR code siswa untuk mencatat kehadiran secara real-time
- **Dashboard Absensi**: Visualisasi data kehadiran dengan statistik lengkap  
- **Manajemen Siswa**: CRUD data siswa dengan sistem pencarian dan filter
- **Responsive Design**: Optimized untuk mobile, tablet, dan desktop
- **Real-time Updates**: Sinkronisasi data secara real-time dengan Supabase
- **Mobile-First**: Didesain khusus untuk penggunaan di perangkat mobile/tablet

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **QR Scanner**: qr-scanner library
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Form Handling**: React Hook Form + Zod validation

## 📱 Cara Kerja

1. **Setup Siswa**: Admin menambahkan data siswa dan generate QR code unik
2. **Distribusi QR**: Setiap siswa mendapat kartu dengan QR code personal
3. **Scanning**: Guru/staff menggunakan tablet/HP untuk scan QR code siswa
4. **Recording**: Sistem otomatis mencatat waktu dan status kehadiran
5. **Monitoring**: Dashboard menampilkan statistik kehadiran real-time

## 🏗️ Setup Project

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Account Supabase

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd absensi_siswa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Buat project baru di [Supabase](https://supabase.com)
   - Copy URL dan API Key dari project settings
   - Jalankan SQL schema (lihat bagian Database Setup)

4. **Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT CHECK (status IN ('present', 'late', 'absent')) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table (optional)
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher TEXT NOT NULL,
  schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_qr_code ON students(qr_code);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON students FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON attendance FOR ALL USING (auth.role() = 'authenticated');
```

## 📋 Struktur Project

```
src/
├── app/                   # Next.js App Router
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── QRScanner.tsx     # QR code scanner component
│   ├── AttendanceDashboard.tsx  # Dashboard with stats
│   └── StudentManagement.tsx   # Student CRUD operations
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client configuration
│   └── qr-scanner.ts     # QR scanner utilities
├── services/             # Business logic services
│   └── attendance.ts     # Attendance operations
├── store/                # Zustand state management
│   └── attendance.ts     # Attendance store
└── types/                # TypeScript type definitions
    └── index.ts          # Shared types
```

## 🎯 Penggunaan

### 1. Menambah Data Siswa
- Buka tab "Data Siswa"
- Klik "Tambah Siswa"
- Isi form dengan data siswa
- QR code akan di-generate otomatis

### 2. Melakukan Absensi
- Buka tab "Scanner QR"
- Klik "Start Scanner" 
- Arahkan kamera ke QR code siswa
- Sistem akan otomatis mencatat kehadiran

### 3. Monitoring Dashboard
- Buka tab "Dashboard"
- Lihat statistik kehadiran real-time
- Monitor absensi siswa hari ini

## 🔧 Kustomisasi

### Mengubah Waktu Batas Terlambat
Edit di `src/services/attendance.ts`:

```typescript
// Default: siswa terlambat jika absen setelah jam 08:00
AttendanceService.determineAttendanceStatus(time, '08:00:00')
```

### Menambah Validasi QR Code
Edit di `src/lib/qr-scanner.ts`:

```typescript
static validateQRCode(qrData: string) {
  // Tambah validasi custom di sini
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository di [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Manual Deployment
```bash
npm run build
npm start
```

## 🔒 Security Considerations

- Setup Row Level Security (RLS) di Supabase
- Implementasi rate limiting untuk scanning
- Validasi QR code untuk mencegah abuse
- Sanitize semua user input

## 📝 TODO / Roadmap

- [ ] Sistem autentikasi untuk admin
- [ ] Export data absensi ke Excel/PDF
- [ ] Notifikasi real-time untuk orang tua
- [ ] Integrasi dengan sistem akademik
- [ ] Multi-tenancy untuk beberapa sekolah
- [ ] Offline mode dengan sync

## 🐛 Troubleshooting

### Camera tidak bisa dibuka
- Pastikan menggunakan HTTPS di production
- Check permission browser untuk camera access
- Test di browser yang berbeda

### QR Code tidak ter-scan
- Pastikan QR code tidak rusak/blur
- Check pencahayaan yang cukup
- Coba restart scanner

### Database connection error
- Verify Supabase credentials di `.env.local`
- Check network connection
- Verify RLS policies

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di GitHub repository ini.

---

**Happy Coding! 🎉**
