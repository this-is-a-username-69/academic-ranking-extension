import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      ipcRenderer.invoke('auth:login', credentials),
  },
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
    }) => ipcRenderer.invoke('scores:upsert', params),
    getByClass: (params: {
      className: string
      subjectName: string
      semester: number
      academicYear: string
    }) => ipcRenderer.invoke('scores:getByClass', params),
  },
  ranking: {
    getClass: (params: {
      className: string
      semester: number
      academicYear: string
    }) => ipcRenderer.invoke('ranking:getClass', params),
    getSchool: (params: { semester: number; academicYear: string }) =>
      ipcRenderer.invoke('ranking:getSchool', params),
  },
  students: {
    getByClass: (params: { className: string }) =>
      ipcRenderer.invoke('students:getByClass', params),
    getAll: () => ipcRenderer.invoke('students:getAll'),
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (params: {
      username: string
      password: string
      fullName: string
      role: 'student' | 'teacher' | 'admin'
      className?: string
    }) => ipcRenderer.invoke('users:create', params),
    toggleLock: (params: { userId: string; requesterId: string }) =>
      ipcRenderer.invoke('users:toggleLock', params),
    delete: (params: { userId: string; requesterId: string }) =>
      ipcRenderer.invoke('users:delete', params),
    verify: (params: { userId: string; verifiedBy: string }) =>
      ipcRenderer.invoke('users:verify', params),
  },
  criteria: {
    getAll: () => ipcRenderer.invoke('criteria:getAll'),
    upsert: (params: {
      id?: string
      level: string
      minGpa: number
      maxGpa: number
      description?: string
    }) => ipcRenderer.invoke('criteria:upsert', params),
    delete: (params: { id: string }) =>
      ipcRenderer.invoke('criteria:delete', params),
  },
  subjects: {
    getAll: () => ipcRenderer.invoke('subjects:getAll'),
    upsert: (params: { id?: string; name: string; weight: number }) =>
      ipcRenderer.invoke('subjects:upsert', params),
    delete: (params: { id: string }) =>
      ipcRenderer.invoke('subjects:delete', params),
  },
  classes: {
    getAll: () => ipcRenderer.invoke('classes:getAll'),
    upsert: (params: {
      id?: string
      name: string
      grade: string
      academicYear: string
    }) => ipcRenderer.invoke('classes:upsert', params),
    delete: (params: { id: string }) =>
      ipcRenderer.invoke('classes:delete', params),
    deleteByYear: (params: { academicYear: string }) =>
      ipcRenderer.invoke('classes:deleteByYear', params),
  },
  academicYears: {
    getAll: () => ipcRenderer.invoke('academicYears:getAll'),
    upsert: (params: {
      id?: string
      name: string
      startDate: string
      endDate: string
      isCurrent: boolean
    }) => ipcRenderer.invoke('academicYears:upsert', params),
    delete: (params: { id: string }) =>
      ipcRenderer.invoke('academicYears:delete', params),
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
