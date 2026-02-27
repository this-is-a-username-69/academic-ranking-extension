import { ElectronAPI } from '@electron-toolkit/preload'

interface RankEntry {
  rank: number
  studentId: string
  studentName: string
  className: string
  gpa: number
  academicLevel: string
}

interface Api {
  auth: {
    login: (credentials: { username: string; password: string }) => Promise<{
      success: boolean
      error?: string
      user?: {
        id: string
        username: string
        fullName: string
        role: 'student' | 'teacher' | 'admin'
        isSuperAdmin: boolean
      }
    }>
  }
  scores: {
    upsert: (params: {
      studentId: string
      subjectName: string
      subjectWeight: number
      score15min: number | null
      score1period: number | null
      scoreFinal: number | null
      semester: number
      academicYear: string
      enteredBy: string
    }) => Promise<{ success: boolean; error?: string }>
    getByClass: (params: {
      className: string
      subjectName: string
      semester: number
      academicYear: string
    }) => Promise<{ success: boolean; data?: unknown[] }>
  }
  ranking: {
    getClass: (params: {
      className: string
      semester: number
      academicYear: string
    }) => Promise<{ success: boolean; data?: RankEntry[] }>
    getSchool: (params: {
      semester: number
      academicYear: string
    }) => Promise<{ success: boolean; data?: RankEntry[] }>
  }
  students: {
    getByClass: (params: { className: string }) => Promise<{
      success: boolean
      data?: {
        studentId: string
        studentName: string
        studentCode: string
        className: string
      }[]
    }>
    getAll: () => Promise<{ success: boolean; data?: unknown[] }>
  }
  users: {
    getAll: () => Promise<{
      success: boolean
      data?: {
        id: string
        username: string
        fullName: string
        role: 'student' | 'teacher' | 'admin'
        isSuperAdmin: boolean
        isVerified: boolean
        isActive: boolean
        createdAt: string
      }[]
    }>
    create: (params: {
      username: string
      password: string
      fullName: string
      role: 'student' | 'teacher' | 'admin'
      className?: string
    }) => Promise<{ success: boolean; error?: string }>
    toggleLock: (params: {
      userId: string
      requesterId: string
    }) => Promise<{ success: boolean; error?: string }>
    delete: (params: {
      userId: string
      requesterId: string
    }) => Promise<{ success: boolean; error?: string }>
    verify: (params: {
      userId: string
      verifiedBy: string
    }) => Promise<{ success: boolean; error?: string }>
  }
  criteria: {
    getAll: () => Promise<{
      success: boolean
      data?: {
        id: string
        level: string
        minGpa: number
        maxGpa: number
        description?: string
      }[]
    }>
    upsert: (params: {
      id?: string
      level: string
      minGpa: number
      maxGpa: number
      description?: string
    }) => Promise<{ success: boolean }>
    delete: (params: { id: string }) => Promise<{ success: boolean }>
  }
  subjects: {
    getAll: () => Promise<{
      success: boolean
      data?: { id: string; name: string; weight: number; isActive: boolean }[]
    }>
    upsert: (params: {
      id?: string
      name: string
      weight: number
    }) => Promise<{ success: boolean }>
    delete: (params: { id: string }) => Promise<{ success: boolean }>
  }
  classes: {
    getAll: () => Promise<{
      success: boolean
      data?: {
        id: string
        name: string
        grade: string
        academicYear: string
        isActive: boolean
      }[]
    }>
    upsert: (params: {
      id?: string
      name: string
      grade: string
      academicYear: string
    }) => Promise<{ success: boolean }>
    delete: (params: { id: string }) => Promise<{ success: boolean }>
    deleteByYear: (params: {
      academicYear: string
    }) => Promise<{ success: boolean }>
  }
  academicYears: {
    getAll: () => Promise<{
      success: boolean
      data?: {
        id: string
        name: string
        startDate: string
        endDate: string
        isCurrent: boolean
      }[]
    }>
    upsert: (params: {
      id?: string
      name: string
      startDate: string
      endDate: string
      isCurrent: boolean
    }) => Promise<{ success: boolean }>
    delete: (params: { id: string }) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
