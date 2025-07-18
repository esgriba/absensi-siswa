# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js TypeScript project for a student attendance system using QR code scanning. The application uses:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for database and authentication
- QR code scanning for attendance marking
- Mobile-first responsive design

## Key Features
- QR code scanner for student attendance
- Student management system
- Attendance tracking and reporting
- Mobile/tablet optimized interface
- Real-time data synchronization with Supabase

## Coding Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router patterns
- Implement responsive design with Tailwind CSS
- Use Supabase client for database operations
- Prioritize mobile-first design for tablet/phone usage
- Implement proper error handling and loading states
- Use React hooks and modern patterns
- Follow accessibility best practices

## Database Structure
- Students table (id, name, student_id, qr_code, class, etc.)
- Attendance table (id, student_id, date, time, status)
- Classes table (id, name, teacher, schedule)

## Security Considerations
- Validate QR codes before processing
- Implement rate limiting for attendance marking
- Use Supabase RLS (Row Level Security)
- Sanitize all user inputs
