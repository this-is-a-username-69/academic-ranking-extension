import React, { useState } from 'react'
import ScoreInput from './ScoreInput'
import RankingView from '../ranking/RankingView'

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

type Page = 'dashboard' | 'scores' | 'ranking'

export default function StudentDashboard({
  user,
  onLogout,
}: Props): React.JSX.Element {
  const [page, setPage] = useState<Page>('dashboard')

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
            label="Input Scores"
            active={page === 'scores'}
            onClick={() => setPage('scores')}
          />
          <NavItem
            label="Ranking"
            active={page === 'ranking'}
            onClick={() => setPage('ranking')}
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
            {page === 'dashboard' ? 'Dashboard' : 'Nhập điểm thử'}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.fullName}</span>
            <span className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-1 rounded-full">
              Student
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
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Thông tin cá nhân
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">
                    {user.fullName}
                  </p>
                  <p className="text-slate-500 text-sm">@{user.username}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => setPage('scores')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Nhập điểm thử
                </button>
                <button
                  onClick={() => setPage('ranking')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Xem bảng xếp hạng
                </button>
              </div>
            </div>
          </main>
        )}

        {page === 'scores' && (
          <ScoreInput onBack={() => setPage('dashboard')} />
        )}
        {page === 'ranking' && <RankingView currentStudentId={user.id} />}
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
