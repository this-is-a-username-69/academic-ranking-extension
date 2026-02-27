import React, { useState, useEffect } from 'react'

type Tab = 'criteria' | 'subjects' | 'classes' | 'years'

export default function AcademicCriteria(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('criteria')

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Academic Criteria
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: 'criteria', label: 'Xếp loại' },
            { key: 'subjects', label: 'Môn học' },
            { key: 'classes', label: 'Danh sách lớp' },
            { key: 'years', label: 'Năm học' },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'criteria' && <CriteriaTab />}
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'classes' && <ClassesTab />}
      {tab === 'years' && <YearsTab />}
    </div>
  )
}

// ── CRITERIA TAB ──
function CriteriaTab(): React.JSX.Element {
  const [data, setData] = useState<
    {
      id: string
      level: string
      minGpa: number
      maxGpa: number
      description?: string
    }[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    level: string
    minGpa: number
    maxGpa: number
    description?: string
  } | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.criteria.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  const reload = async (): Promise<void> => {
    const result = await window.api.criteria.getAll()
    if (result.success && result.data) setData(result.data)
  }

  const handleDelete = async (id: string, level: string): Promise<void> => {
    if (!confirm(`Xóa xếp loại "${level}"?`)) return
    await window.api.criteria.delete({ id })
    setMessage(`Đã xóa "${level}".`)
    reload()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">
          Cấu hình điều kiện xếp loại học lực theo GPA.
        </p>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Thêm xếp loại
        </button>
      </div>
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left">Xếp loại</th>
              <th className="px-4 py-3 text-center">GPA tối thiểu</th>
              <th className="px-4 py-3 text-center">GPA tối đa</th>
              <th className="px-4 py-3 text-left">Mô tả</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-8">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {row.level}
                </td>
                <td className="px-4 py-3 text-center text-sm">{row.minGpa}</td>
                <td className="px-4 py-3 text-center text-sm">{row.maxGpa}</td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {row.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditing(row)
                        setShowModal(true)
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(row.id, row.level)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <CriteriaModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setMessage(editing ? 'Đã cập nhật.' : 'Đã thêm mới.')
            reload()
          }}
        />
      )}
    </div>
  )
}

function CriteriaModal({
  initial,
  onClose,
  onSuccess,
}: {
  initial: {
    id: string
    level: string
    minGpa: number
    maxGpa: number
    description?: string
  } | null
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const [level, setLevel] = useState(initial?.level ?? '')
  const [minGpa, setMinGpa] = useState(String(initial?.minGpa ?? ''))
  const [maxGpa, setMaxGpa] = useState(String(initial?.maxGpa ?? ''))
  const [description, setDescription] = useState(initial?.description ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!level || !minGpa || !maxGpa) return
    setLoading(true)
    await window.api.criteria.upsert({
      id: initial?.id,
      level,
      minGpa: parseFloat(minGpa),
      maxGpa: parseFloat(maxGpa),
      description: description || undefined,
    })
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {initial ? 'Sửa xếp loại' : 'Thêm xếp loại'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Tên xếp loại
            </label>
            <input
              title="Tên xếp loại"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: Xuất Sắc"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">
                GPA tối thiểu
              </label>
              <input
                title="GPA tối thiểu"
                type="number"
                step={0.1}
                value={minGpa}
                onChange={(e) => setMinGpa(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="8.5"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">
                GPA tối đa
              </label>
              <input
                title="GPA tối đa"
                type="number"
                step={0.1}
                value={maxGpa}
                onChange={(e) => setMaxGpa(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Mô tả</label>
            <input
              title="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Tùy chọn"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SUBJECTS TAB ──
function SubjectsTab(): React.JSX.Element {
  const [data, setData] = useState<
    { id: string; name: string; weight: number; isActive: boolean }[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    name: string
    weight: number
  } | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.subjects.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  const reload = async (): Promise<void> => {
    const result = await window.api.subjects.getAll()
    if (result.success && result.data) setData(result.data)
  }

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Xóa môn "${name}"?`)) return
    await window.api.subjects.delete({ id })
    setMessage(`Đã xóa "${name}".`)
    reload()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">
          Quản lý danh sách môn học và hệ số.
        </p>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Thêm môn
        </button>
      </div>
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left">Môn học</th>
              <th className="px-4 py-3 text-center">Hệ số</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-slate-400 py-8">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-center text-sm">{row.weight}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditing(row)
                        setShowModal(true)
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(row.id, row.name)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <SubjectModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setMessage(editing ? 'Đã cập nhật.' : 'Đã thêm mới.')
            reload()
          }}
        />
      )}
    </div>
  )
}

function SubjectModal({
  initial,
  onClose,
  onSuccess,
}: {
  initial: { id: string; name: string; weight: number } | null
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? '')
  const [weight, setWeight] = useState(String(initial?.weight ?? '1'))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!name || !weight) return
    setLoading(true)
    await window.api.subjects.upsert({
      id: initial?.id,
      name,
      weight: parseFloat(weight),
    })
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {initial ? 'Sửa môn học' : 'Thêm môn học'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Tên môn</label>
            <input
              title="Tên môn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: Toán"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Hệ số</label>
            <select
              title="Hệ số"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CLASSES TAB ──
function ClassesTab(): React.JSX.Element {
  const [data, setData] = useState<
    { id: string; name: string; grade: string; academicYear: string }[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    name: string
    grade: string
    academicYear: string
  } | null>(null)
  const [message, setMessage] = useState('')
  const [showGenModal, setShowGenModal] = useState(false)

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.classes.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  const reload = async (): Promise<void> => {
    const result = await window.api.classes.getAll()
    if (result.success && result.data) setData(result.data)
  }

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Xóa lớp "${name}"?`)) return
    await window.api.classes.delete({ id })
    setMessage(`Đã xóa lớp "${name}".`)
    reload()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">Quản lý danh sách lớp học.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ⚙ Cấu hình lớp
          </button>
          <button
            onClick={() => {
              setEditing(null)
              setShowModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Thêm lớp
          </button>
        </div>
      </div>
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left">Tên lớp</th>
              <th className="px-4 py-3 text-center">Khối</th>
              <th className="px-4 py-3 text-center">Năm học</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 py-8">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-center text-sm">{row.grade}</td>
                <td className="px-4 py-3 text-center text-sm">
                  {row.academicYear}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditing(row)
                        setShowModal(true)
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(row.id, row.name)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <ClassModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setMessage(editing ? 'Đã cập nhật.' : 'Đã thêm mới.')
            reload()
          }}
        />
      )}
      {showGenModal && (
        <GenerateClassModal
          onClose={() => setShowGenModal(false)}
          onSuccess={() => {
            setShowGenModal(false)
            setMessage('Đã generate lớp thành công.')
            reload()
          }}
        />
      )}
    </div>
  )
}

function ClassModal({
  initial,
  onClose,
  onSuccess,
}: {
  initial: {
    id: string
    name: string
    grade: string
    academicYear: string
  } | null
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState(initial?.grade ?? '10')
  const [academicYear, setAcademicYear] = useState(
    initial?.academicYear ?? '2024-2025',
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!name || !grade || !academicYear) return
    setLoading(true)
    await window.api.classes.upsert({
      id: initial?.id,
      name,
      grade,
      academicYear,
    })
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {initial ? 'Sửa lớp' : 'Thêm lớp'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Tên lớp</label>
            <input
              title="Tên lớp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: 10A1"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Khối</label>
            <select
              title="Khối"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Năm học</label>
            <input
              title="Năm học"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: 2024-2025"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── YEARS TAB ──
function YearsTab(): React.JSX.Element {
  const [data, setData] = useState<
    {
      id: string
      name: string
      startDate: string
      endDate: string
      isCurrent: boolean
    }[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    name: string
    startDate: string
    endDate: string
    isCurrent: boolean
  } | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.academicYears.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  const reload = async (): Promise<void> => {
    const result = await window.api.academicYears.getAll()
    if (result.success && result.data) setData(result.data)
  }

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Xóa năm học "${name}"?`)) return
    await window.api.academicYears.delete({ id })
    setMessage(`Đã xóa "${name}".`)
    reload()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">Cấu hình năm học và học kỳ.</p>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Thêm năm học
        </button>
      </div>
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left">Năm học</th>
              <th className="px-4 py-3 text-center">Bắt đầu</th>
              <th className="px-4 py-3 text-center">Kết thúc</th>
              <th className="px-4 py-3 text-center">Hiện tại</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-8">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {row.startDate}
                </td>
                <td className="px-4 py-3 text-center text-sm">{row.endDate}</td>
                <td className="px-4 py-3 text-center">
                  {row.isCurrent && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                      Hiện tại
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditing(row)
                        setShowModal(true)
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(row.id, row.name)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <YearModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setMessage(editing ? 'Đã cập nhật.' : 'Đã thêm mới.')
            reload()
          }}
        />
      )}
    </div>
  )
}

function YearModal({
  initial,
  onClose,
  onSuccess,
}: {
  initial: {
    id: string
    name: string
    startDate: string
    endDate: string
    isCurrent: boolean
  } | null
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [isCurrent, setIsCurrent] = useState(initial?.isCurrent ?? false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!name || !startDate || !endDate) return
    setLoading(true)
    await window.api.academicYears.upsert({
      id: initial?.id,
      name,
      startDate,
      endDate,
      isCurrent,
    })
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {initial ? 'Sửa năm học' : 'Thêm năm học'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Tên năm học
            </label>
            <input
              title="Tên năm học"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: 2024-2025"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Ngày bắt đầu
            </label>
            <input
              title="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Ngày kết thúc
            </label>
            <input
              title="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isCurrent" className="text-sm text-slate-600">
              Đặt làm năm học hiện tại
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
function GenerateClassModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const [academicYear, setAcademicYear] = useState('2024-2025')
  const [yearList, setYearList] = useState<{ id: string; name: string }[]>([])
  const [grade10Letter, setGrade10Letter] = useState('A')
  const [grade11Letter, setGrade11Letter] = useState('B')
  const [grade12Letter, setGrade12Letter] = useState('C')
  const [classCount, setClassCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.academicYears.getAll()
      if (result.success && result.data) {
        setYearList(result.data)
        const current = result.data.find((y) => y.isCurrent)
        if (current) setAcademicYear(current.name)
      }
    }
    load()
  }, [])

  const letters = [grade10Letter, grade11Letter, grade12Letter]
  const hasDuplicate = new Set(letters).size !== letters.length

  const handleGenerate = async (): Promise<void> => {
    if (hasDuplicate) {
      setError('Các khối không được dùng cùng ký tự')
      return
    }
    setLoading(true)
    // Xóa lớp cũ của năm học này
    await window.api.classes.deleteByYear({ academicYear })
    // Generate lớp mới
    const gradeMap = [
      { grade: '10', letter: grade10Letter },
      { grade: '11', letter: grade11Letter },
      { grade: '12', letter: grade12Letter },
    ]
    for (const { grade, letter } of gradeMap) {
      for (let i = 1; i <= classCount; i++) {
        await window.api.classes.upsert({
          name: `${grade}${letter}${i}`,
          grade,
          academicYear,
        })
      }
    }
    onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Cấu hình lớp theo năm học
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Năm học</label>
            <select
              title="Năm học"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {yearList.map((y) => (
                <option key={y.id} value={y.name}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {[
            { label: 'Khối 10', value: grade10Letter, set: setGrade10Letter },
            { label: 'Khối 11', value: grade11Letter, set: setGrade11Letter },
            { label: 'Khối 12', value: grade12Letter, set: setGrade12Letter },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-xs text-slate-500 mb-1">
                {label} — Ký tự lớp
              </label>
              <select
                title={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {LETTERS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Số lớp mỗi khối
            </label>
            <input
              title="Số lớp"
              type="number"
              min={1}
              max={20}
              value={classCount}
              onChange={(e) => setClassCount(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500">
            Preview:{' '}
            {['10', '11', '12']
              .map(
                (g, i) => `${g}${letters[i]}1→${g}${letters[i]}${classCount}`,
              )
              .join(', ')}
          </div>

          {hasDuplicate && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
              Các khối không được dùng cùng ký tự
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || hasDuplicate}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang generate...' : 'Generate lớp'}
          </button>
        </div>
      </div>
    </div>
  )
}
