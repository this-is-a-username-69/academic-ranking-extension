import React, { useState, useEffect } from 'react'
import ScoreManagement from './ScoreManagement'
import RankingView from '../ranking/RankingView'
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

type Page = 'dashboard' | 'scores' | 'ranking' | 'criteria'

export default function TeacherDashboard({
  user,
  onLogout,
}: Props): React.JSX.Element {
  const [page, setPage] = useState<Page>('dashboard')
  const [stats, setStats] = useState({
    total: 0,
    excellent: 0,
    good: 0,
    average: 0,
    weak: 0,
  })

  const loadStats = async (): Promise<void> => {
    const studentRes = await window.api.students.getAll()
    if (studentRes.success && studentRes.data) {
      const total = studentRes.data.length
      // Fetch ranking để lấy học lực
      const yearRes = await window.api.academicYears.getAll()
      let currentYear = '2024-2025'
      if (yearRes.success && yearRes.data) {
        const current = yearRes.data.find((y) => y.isCurrent)
        if (current) currentYear = current.name
      }
      const rankRes = await window.api.ranking.getSchool({
        semester: 1,
        academicYear: currentYear,
      })
      if (rankRes.success && rankRes.data) {
        const excellent = rankRes.data.filter(
          (r) => r.academicLevel === 'Xuất Sắc',
        ).length
        const good = rankRes.data.filter(
          (r) => r.academicLevel === 'Giỏi' || r.academicLevel === 'Khá',
        ).length
        const average = rankRes.data.filter(
          (r) => r.academicLevel === 'Trung Bình',
        ).length
        const weak = rankRes.data.filter(
          (r) => r.academicLevel === 'Yếu',
        ).length
        setStats({ total, excellent, good, average, weak })
      } else {
        setStats((prev) => ({ ...prev, total }))
      }
    }
  }

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-60 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <span className="font-bold text-lg">Academic Ranking</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem
            label="Dashboard"
            active={page === 'dashboard'}
            onClick={() => {
              setPage('dashboard')
              loadStats()
            }}
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
        </nav>
        <div className="px-6 py-3 text-slate-500 text-xs border-t border-slate-700">
          v1.0.0
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <span className="font-semibold text-slate-700">
            {page === 'dashboard' && 'Dashboard'}
            {page === 'scores' && 'Quản lý điểm'}
            {page === 'ranking' && 'Bảng xếp hạng'}
            {page === 'criteria' && 'Academic Criteria'}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.fullName}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              Teacher
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {page === 'dashboard' && (
          <main className="flex-1 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Tổng quan</h2>
            <div className="grid grid-cols-5 gap-4">
              <StatCard
                label="Tổng học sinh"
                value={String(stats.total)}
                color="bg-blue-500"
              />
              <StatCard
                label="Xuất sắc"
                value={String(stats.excellent)}
                color="bg-emerald-500"
              />
              <StatCard
                label="Khá / Giỏi"
                value={String(stats.good)}
                color="bg-blue-500"
              />
              <StatCard
                label="Trung bình"
                value={String(stats.average)}
                color="bg-amber-500"
              />
              <StatCard
                label="Yếu"
                value={String(stats.weak)}
                color="bg-red-500"
              />
            </div>
          </main>
        )}

        <div className={page === 'scores' ? 'flex-1 flex flex-col' : 'hidden'}>
          <ScoreManagement user={user} />
        </div>
        <div className={page === 'ranking' ? 'flex-1 flex flex-col' : 'hidden'}>
          <RankingView />
        </div>
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
