import React, { useState, useEffect } from 'react'

interface Props {
  user: { id: string; isSuperAdmin: boolean }
}

interface UserRow {
  id: string
  username: string
  fullName: string
  role: 'student' | 'teacher' | 'admin'
  isSuperAdmin: boolean
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

const ROLE_BADGE: Record<string, string> = {
  student: 'bg-teal-100 text-teal-700',
  teacher: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
}

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
}

export default function AccountManagement({ user }: Props): React.JSX.Element {
  const [accounts, setAccounts] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAccounts = async (): Promise<void> => {
    setLoading(true)
    const result = await window.api.users.getAll()
    if (result.success && result.data) {
      setAccounts(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true)
      const result = await window.api.users.getAll()
      if (result.success && result.data) {
        setAccounts(result.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleToggleLock = async (
    userId: string,
    fullName: string,
  ): Promise<void> => {
    const result = await window.api.users.toggleLock({
      userId,
      requesterId: user.id,
    })
    if (result.success) {
      setMessage(`Đã cập nhật trạng thái tài khoản ${fullName}.`)
      loadAccounts()
    } else {
      setError(result.error ?? 'Lỗi không xác định')
    }
  }

  const handleDelete = async (
    userId: string,
    fullName: string,
  ): Promise<void> => {
    if (
      !confirm(`Xóa tài khoản "${fullName}"? Hành động này không thể hoàn tác.`)
    )
      return
    const result = await window.api.users.delete({
      userId,
      requesterId: user.id,
    })
    if (result.success) {
      setMessage(`Đã xóa tài khoản ${fullName}.`)
      loadAccounts()
    } else {
      setError(result.error ?? 'Lỗi không xác định')
    }
  }

  const handleVerify = async (
    userId: string,
    fullName: string,
  ): Promise<void> => {
    const result = await window.api.users.verify({
      userId,
      verifiedBy: user.id,
    })
    if (result.success) {
      setMessage(`Đã xác minh tài khoản ${fullName}.`)
      loadAccounts()
    } else {
      setError(result.error ?? 'Lỗi không xác định')
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Quản lý tài khoản</h2>
        <button
          onClick={() => {
            setShowModal(true)
            setMessage('')
            setError('')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Tạo tài khoản
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          ✗ {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-slate-400 py-12">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Xác minh</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr
                  key={acc.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {acc.fullName}
                    {acc.isSuperAdmin && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">
                        (Super Admin)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    @{acc.username}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[acc.role]}`}
                    >
                      {ROLE_LABEL[acc.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${acc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                    >
                      {acc.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {acc.role === 'admin' && !acc.isSuperAdmin ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${acc.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {acc.isVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!acc.isSuperAdmin && (
                      <div className="flex items-center justify-center gap-2">
                        {/* Verify button - chỉ Super Admin thấy, chỉ với admin chưa verify */}
                        {user.isSuperAdmin &&
                          acc.role === 'admin' &&
                          !acc.isVerified && (
                            <button
                              onClick={() => handleVerify(acc.id, acc.fullName)}
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded"
                            >
                              Xác minh
                            </button>
                          )}
                        <button
                          onClick={() => handleToggleLock(acc.id, acc.fullName)}
                          className={`text-xs px-2 py-1 rounded ${acc.isActive ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}`}
                        >
                          {acc.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id, acc.fullName)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <CreateAccountModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setMessage('Tạo tài khoản thành công.')
            loadAccounts()
          }}
        />
      )}
    </div>
  )
}

function CreateAccountModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}): React.JSX.Element {
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [classList, setClassList] = useState<{ id: string; name: string }[]>([])
  const [subjectList, setSubjectList] = useState<
    { id: string; name: string }[]
  >([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async (): Promise<void> => {
      const [classRes, subRes] = await Promise.all([
        window.api.classes.getAll(),
        window.api.subjects.getAll(),
      ])
      if (classRes.success && classRes.data) setClassList(classRes.data)
      if (subRes.success && subRes.data) setSubjectList(subRes.data)
    }
    load()
  }, [])

  const toggleSubject = (name: string): void => {
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    )
  }

  const toggleClass = (name: string): void => {
    setSelectedClasses((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    )
  }

  const handleSubmit = async (): Promise<void> => {
    if (!fullName || !username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (role === 'student' && !selectedClass) {
      setError('Vui lòng chọn lớp')
      return
    }
    if (role === 'teacher' && selectedSubjects.length === 0) {
      setError('Vui lòng chọn ít nhất 1 môn dạy')
      return
    }
    setLoading(true)
    const result = await window.api.users.create({
      username,
      password,
      fullName,
      role,
      className: selectedClass,
    })
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error ?? 'Lỗi không xác định')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-120 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Tạo tài khoản mới
        </h3>

        {/* Role selector */}
        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-2">Role</label>
          <div className="flex gap-2">
            {(['student', 'teacher', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r === 'student'
                  ? 'Student'
                  : r === 'teacher'
                    ? 'Teacher'
                    : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
            <input
              title="Họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Nguyen Van A"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Tên đăng nhập
            </label>
            <input
              title="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="nguyenvana"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Mật khẩu
            </label>
            <input
              title="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          {/* Student: chọn lớp */}
          {role === 'student' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Lớp</label>
              <select
                title="Lớp"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Chọn lớp --</option>
                {classList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher: chọn môn + lớp */}
          {role === 'teacher' && (
            <>
              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  Môn dạy
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjectList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSubject(s.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedSubjects.includes(s.name)
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  Lớp đang dạy
                </label>
                <div className="flex flex-wrap gap-2">
                  {classList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleClass(c.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedClasses.includes(c.name)
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {role === 'admin' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">
              ⚠️ Admin mới cần được Super Admin xác minh trước khi đăng nhập.
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
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  )
}
