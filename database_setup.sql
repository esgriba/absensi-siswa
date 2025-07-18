-- Sistem Absensi Siswa - Database Schema
-- Jalankan SQL ini di Supabase SQL Editor

-- Create students table
CREATE TABLE IF NOT EXISTS students (
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
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT CHECK (status IN ('present', 'late', 'absent')) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table (optional untuk fitur masa depan)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher TEXT NOT NULL,
  schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_qr_code ON students(qr_code);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- Create unique constraint untuk mencegah duplikasi absensi
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_daily 
ON attendance(student_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON students;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable read access for all users" ON attendance;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON attendance;
DROP POLICY IF EXISTS "Enable read access for all users" ON classes;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON classes;

-- Create policies untuk students table
CREATE POLICY "Enable read access for all users" ON students 
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON students 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON students 
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON students 
FOR DELETE USING (true);

-- Create policies untuk attendance table
CREATE POLICY "Enable read access for all users" ON attendance 
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON attendance 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON attendance 
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON attendance 
FOR DELETE USING (true);

-- Create policies untuk classes table
CREATE POLICY "Enable read access for all users" ON classes 
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON classes 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON classes 
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON classes 
FOR DELETE USING (true);

-- Function untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at di students table
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data untuk testing
INSERT INTO students (student_id, name, class, qr_code, email) VALUES 
('2024001', 'Ahmad Rizki', '12 IPA 1', '{"type":"student_attendance","student_id":"2024001","timestamp":1642723200000}', 'ahmad.rizki@email.com'),
('2024002', 'Siti Aminah', '12 IPA 1', '{"type":"student_attendance","student_id":"2024002","timestamp":1642723200000}', 'siti.aminah@email.com'),
('2024003', 'Budi Santoso', '12 IPA 2', '{"type":"student_attendance","student_id":"2024003","timestamp":1642723200000}', 'budi.santoso@email.com'),
('2024004', 'Dewi Lestari', '12 IPS 1', '{"type":"student_attendance","student_id":"2024004","timestamp":1642723200000}', 'dewi.lestari@email.com'),
('2024005', 'Eko Prasetyo', '12 IPS 1', '{"type":"student_attendance","student_id":"2024005","timestamp":1642723200000}', 'eko.prasetyo@email.com')
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample classes
INSERT INTO classes (name, teacher, schedule) VALUES 
('12 IPA 1', 'Pak Sudirman', 'Senin-Jumat 07:00-15:00'),
('12 IPA 2', 'Bu Sari', 'Senin-Jumat 07:00-15:00'),
('12 IPS 1', 'Pak Budi', 'Senin-Jumat 07:00-15:00')
ON CONFLICT DO NOTHING;

-- Function untuk mendapatkan statistik absensi
CREATE OR REPLACE FUNCTION get_attendance_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_students BIGINT,
  present_today BIGINT,
  late_today BIGINT,
  absent_today BIGINT,
  attendance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      (SELECT COUNT(*) FROM students) as total,
      (SELECT COUNT(*) FROM attendance WHERE date = target_date AND status = 'present') as present,
      (SELECT COUNT(*) FROM attendance WHERE date = target_date AND status = 'late') as late
  )
  SELECT 
    stats.total,
    stats.present,
    stats.late,
    stats.total - stats.present - stats.late as absent,
    CASE 
      WHEN stats.total > 0 THEN 
        ROUND(((stats.present + stats.late)::NUMERIC / stats.total::NUMERIC) * 100, 2)
      ELSE 0 
    END as rate
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Function untuk mendapatkan absensi hari ini dengan info siswa
CREATE OR REPLACE FUNCTION get_today_attendance_with_students(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  attendance_id UUID,
  student_id UUID,
  student_name TEXT,
  student_class TEXT,
  student_number TEXT,
  attendance_date DATE,
  attendance_time TIME,
  attendance_status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    s.id,
    s.name,
    s.class,
    s.student_id,
    a.date,
    a.time,
    a.status,
    a.created_at
  FROM attendance a
  JOIN students s ON a.student_id = s.id
  WHERE a.date = target_date
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Tampilkan hasil
SELECT 'Database schema created successfully!' as message;
SELECT 'Sample data inserted!' as message;
SELECT 'Total students: ' || COUNT(*) as message FROM students;
