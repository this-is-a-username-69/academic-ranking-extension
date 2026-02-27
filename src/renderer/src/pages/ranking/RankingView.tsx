import React, { useState, useEffect } from 'react'

interface RankEntry {
  rank: number
  studentId: string
  studentName: string
  className: string
  gpa: number
  academicLevel: string
}

interface Props {
  currentStudentId?: string
}

const LEVEL_COLORS: Record<string, string> = {
  'Xuất Sắc': 'bg-emerald-100 text-emerald-700',
  Giỏi: 'bg-blue-100 text-blue-700',
  Khá: 'bg-amber-100 text-amber-700',
  'Trung Bình': 'bg-orange-100 text-orange-700',
  Yếu: 'bg-red-100 text-red-700',
}

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function RankingView({
  currentStudentId,
}: Props): React.JSX.Element {
  const [tab, setTab] = useState<'class' | 'school'>('class')
  const [className, setClassName] = useState('10A1')
  const [semester, setSemester] = useState(1)
  const [academicYear, setAcademicYear] = useState('2024-2025')
  const [data, setData] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.academicYears.getAll()
      if (result.success && result.data) {
        const current = result.data.find((y) => y.isCurrent)
        if (current) setAcademicYear(current.name)
      }
    }
    load()
  }, [])

  const handleLoad = async (): Promise<void> => {
    setLoading(true)
    setLoaded(false)

    let result
    if (tab === 'class') {
      result = await window.api.ranking.getClass({
        className,
        semester,
        academicYear,
      })
    } else {
      result = await window.api.ranking.getSchool({ semester, academicYear })
    }

    setData(result.data ?? [])
    setLoading(false)
    setLoaded(true)
    setSelectedClasses([]) // reset filter khi load mới
  }

  // Lấy danh sách lớp unique từ data
  const allClasses = [...new Set(data.map((r) => r.className))].sort()

  const toggleClass = (cls: string): void => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    )
  }

  const filtered = data.filter((r) => {
    const matchSearch = r.studentName
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchClass =
      tab === 'school' && selectedClasses.length > 0
        ? selectedClasses.includes(r.className)
        : true
    return matchSearch && matchClass
  })

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['class', 'school'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setLoaded(false)
              setData([])
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t === 'class' ? 'Theo lớp' : 'Toàn trường'}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-4 mb-4 items-end flex-wrap">
        {tab === 'class' && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Lớp</label>
            <input
              title="Lớp"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: 10A1"
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Học kỳ</label>
          <select
            title="Học kỳ"
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
          </select>
        </div>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {loading ? 'Đang tải...' : 'Tải bảng xếp hạng'}
        </button>

        {loaded && (
          <input
            title="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ml-auto"
          />
        )}
      </div>

      {/* Class filter checklist - chỉ hiện ở tab toàn trường */}
      {loaded && tab === 'school' && allClasses.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500 self-center">
            Lọc theo lớp:
          </span>
          {allClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => toggleClass(cls)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                selectedClasses.includes(cls)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cls}
            </button>
          ))}
          {selectedClasses.length > 0 && (
            <button
              onClick={() => setSelectedClasses([])}
              className="px-3 py-1 rounded-full text-xs text-red-500 border border-red-200 hover:bg-red-50"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {loaded &&
        (filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="px-4 py-3 text-center w-16">Hạng</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  {tab === 'school' && (
                    <th className="px-4 py-3 text-left">Lớp</th>
                  )}
                  <th className="px-4 py-3 text-center">Điểm TB</th>
                  <th className="px-4 py-3 text-center">Học lực</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const isCurrentStudent =
                    currentStudentId && row.studentId === currentStudentId
                  return (
                    <tr
                      key={row.studentId}
                      className={`text-sm ${
                        isCurrentStudent
                          ? 'bg-amber-50 border-l-4 border-amber-400'
                          : i % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-center font-bold text-slate-600">
                        {RANK_MEDALS[row.rank] ?? row.rank}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {row.studentName}
                        {isCurrentStudent && (
                          <span className="ml-2 text-xs text-amber-600 font-normal">
                            (Bạn)
                          </span>
                        )}
                      </td>
                      {tab === 'school' && (
                        <td className="px-4 py-3 text-slate-500">
                          {row.className}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {row.gpa}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[row.academicLevel] ?? ''}`}
                        >
                          {row.academicLevel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  )
}
