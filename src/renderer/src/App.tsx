import React, { useState } from 'react'
import Login from './pages/Login'
import StudentDashboard from './pages/student/StudentDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

interface User {
  id: string
  username: string
  fullName: string
  role: 'student' | 'teacher' | 'admin'
  isSuperAdmin: boolean
}

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)

  const handleLogout = (): void => setUser(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  if (user.role === 'student') {
    return <StudentDashboard user={user} onLogout={handleLogout} />
  }

  if (user.role === 'teacher') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />
}

export default App
