import React, { useState, useEffect } from 'react'
import AccountManagement from './AccountManagement'
import RankingView from '../ranking/RankingView'
import ScoreManagement from '../teacher/ScoreManagement'
import AcademicCriteria from './AcademicCriteria'

interface Props {
  user: {
    id: string
    username: string
    fullName: string
    role: string
    isSuperAdmin: boolean
  }
  onLogout: () => void
}

type Page = 'dashboard' | 'accounts' | 'ranking' | 'scores' | 'criteria'

export default function AdminDashboard({
  user,
  onLogout,
}: Props): React.JSX.Element {
  const [page, setPage] = useState<Page>('dashboard')
  const [stats, setStats] = useState({ total: 0, students: 0, teachers: 0 })

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.users.getAll()
      if (result.success && result.data) {
        const data = result.data
        setStats({
          total: data.length,
          students: data.filter((u) => u.role === 'student').length,
          teachers: data.filter((u) => u.role === 'teacher').length,
        })
      }
    }
    load()
  }, [])

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <span className="font-bold text-lg">Academic Ranking</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => setPage('dashboard')}
          />
          <NavItem
            label="Scores"
            active={page === 'scores'}
            onClick={() => setPage('scores')}
          />
          <NavItem
            label="Ranking"
            active={page === 'ranking'}
            onClick={() => setPage('ranking')}
          />
          <NavItem
            label="Academic Criteria"
            active={page === 'criteria'}
            onClick={() => setPage('criteria')}
          />
          <NavItem
            label="Account Management"
            active={page === 'accounts'}
            onClick={() => setPage('accounts')}
          />
        </nav>
        <div className="px-6 py-3 text-slate-500 text-xs border-t border-slate-700">
          v1.0.0
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <span className="font-semibold text-slate-700">
            {page === 'dashboard' && 'Dashboard'}
            {page === 'scores' && 'Quản lý điểm'}
            {page === 'accounts' && 'Quản lý tài khoản'}
            {page === 'ranking' && 'Bảng xếp hạng'}
            {page === 'criteria' && 'Cấu hình xếp loại'}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.fullName}</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
              {user.isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Content */}
        {page === 'dashboard' && (
          <main className="flex-1 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Tổng quan</h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Tổng tài khoản"
                value={String(stats.total)}
                color="bg-blue-500"
              />
              <StatCard
                label="Học sinh"
                value={String(stats.students)}
                color="bg-emerald-500"
              />
              <StatCard
                label="Giáo viên"
                value={String(stats.teachers)}
                color="bg-amber-500"
              />
            </div>
          </main>
        )}

        {page === 'scores' && <ScoreManagement user={user} />}
        {page === 'accounts' && <AccountManagement user={user} />}
        {page === 'ranking' && <RankingView />}
        {page === 'criteria' && <AcademicCriteria />}
      </div>
    </div>
  )
}

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
        active
          ? 'bg-slate-700 text-white border-l-4 border-blue-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {label}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div
        className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}
      >
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      <span className="text-slate-600 text-sm font-medium">{label}</span>
    </div>
  )
}
