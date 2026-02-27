import React, { useState, useEffect } from 'react'

interface Props {
  user: { id: string; fullName: string }
}

interface ScoreRow {
  studentId: string
  studentName: string
  score15min: string
  score1period: string
  scoreFinal: string
  weightedAvg: number | null
  dirty: boolean
}

interface SubjectOption {
  id: string
  name: string
  weight: number
}

function calcAvg(s1: string, s2: string, s3: string): number | null {
  const v1 = parseFloat(s1),
    v2 = parseFloat(s2),
    v3 = parseFloat(s3)
  const hasAny = !isNaN(v1) || !isNaN(v2) || !isNaN(v3)
  if (!hasAny) return null
  let sum = 0,
    w = 0
  if (!isNaN(v1)) {
    sum += v1 * 1
    w += 1
  }
  if (!isNaN(v2)) {
    sum += v2 * 2
    w += 2
  }
  if (!isNaN(v3)) {
    sum += v3 * 3
    w += 3
  }
  return w > 0 ? Math.round((sum / w) * 100) / 100 : null
}

export default function ScoreManagement({ user }: Props): React.JSX.Element {
  const [className, setClassName] = useState('10A1')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState(1)
  const [academicYear, setAcademicYear] = useState('2024-2025')
  const [rows, setRows] = useState<ScoreRow[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([])

  // Load subjects + students + currentAcademicYear khi mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      // Load current academic year
      const yearResult = await window.api.academicYears.getAll()
      if (yearResult.success && yearResult.data) {
        const current = yearResult.data.find((y) => y.isCurrent)
        if (current) setAcademicYear(current.name)
      }
      // Load subjects
      const subResult = await window.api.subjects.getAll()
      if (subResult.success && subResult.data && subResult.data.length > 0) {
        setSubjectOptions(subResult.data)
        setSubject(subResult.data[0].name)
      }
      // Load students
      setLoading(true)
      const result = await window.api.students.getByClass({ className })
      if (result.success && result.data) {
        setRows(
          result.data.map((s) => ({
            studentId: s.studentId,
            studentName: s.studentName,
            score15min: '',
            score1period: '',
            scoreFinal: '',
            weightedAvg: null,
            dirty: false,
          })),
        )
      }
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    init()
  }, [])

  // Load điểm từ DB khi đổi subject, semester, hoặc sau khi students load xong
  useEffect(() => {
    if (!subject || rows.length === 0) return
    console.log('loadScores triggered', {
      subject,
      semester,
      academicYear,
      className,
      rowsLen: rows.length,
    })
    const loadScores = async (): Promise<void> => {
      const result = await window.api.scores.getByClass({
        className,
        subjectName: subject,
        semester,
        academicYear,
      })
      if (result.success && result.data) {
        const scoreMap = new Map<
          string,
          {
            score15min: number | null
            score1period: number | null
            scoreFinal: number | null
          }
        >()
        ;(
          result.data as {
            studentId: string
            score15min: number | null
            score1period: number | null
            scoreFinal: number | null
          }[]
        ).forEach((s) => {
          scoreMap.set(s.studentId, s)
        })
        setRows((prev) =>
          prev.map((row) => {
            const db = scoreMap.get(row.studentId)
            if (!db)
              return {
                ...row,
                score15min: '',
                score1period: '',
                scoreFinal: '',
                weightedAvg: null,
                dirty: false,
              }
            const s1 = db.score15min?.toString() ?? ''
            const s2 = db.score1period?.toString() ?? ''
            const s3 = db.scoreFinal?.toString() ?? ''
            return {
              ...row,
              score15min: s1,
              score1period: s2,
              scoreFinal: s3,
              weightedAvg: calcAvg(s1, s2, s3),
              dirty: false,
            }
          }),
        )
      }
    }
    loadScores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, semester, academicYear, className])

  const loadStudents = async (): Promise<void> => {
    setLoading(true)
    setMessage('')
    const result = await window.api.students.getByClass({ className })
    if (result.success && result.data) {
      // Fetch scores ngay sau khi có students
      const scoreResult = await window.api.scores.getByClass({
        className,
        subjectName: subject,
        semester,
        academicYear,
      })
      const scoreMap = new Map<
        string,
        {
          score15min: number | null
          score1period: number | null
          scoreFinal: number | null
        }
      >()
      if (scoreResult.success && scoreResult.data) {
        ;(
          scoreResult.data as {
            studentId: string
            score15min: number | null
            score1period: number | null
            scoreFinal: number | null
          }[]
        ).forEach((s) => {
          scoreMap.set(s.studentId, s)
        })
      }
      setRows(
        result.data.map((s) => {
          const db = scoreMap.get(s.studentId)
          if (!db)
            return {
              studentId: s.studentId,
              studentName: s.studentName,
              score15min: '',
              score1period: '',
              scoreFinal: '',
              weightedAvg: null,
              dirty: false,
            }
          const s1 = db.score15min?.toString() ?? ''
          const s2 = db.score1period?.toString() ?? ''
          const s3 = db.scoreFinal?.toString() ?? ''
          return {
            studentId: s.studentId,
            studentName: s.studentName,
            score15min: s1,
            score1period: s2,
            scoreFinal: s3,
            weightedAvg: calcAvg(s1, s2, s3),
            dirty: false,
          }
        }),
      )
    }
    setLoading(false)
  }

  const updateScore = (
    index: number,
    field: 'score15min' | 'score1period' | 'scoreFinal',
    value: string,
  ): void => {
    const num = parseFloat(value)
    if (value !== '' && (isNaN(num) || num < 0 || num > 10)) return
    const updated = [...rows]
    updated[index] = {
      ...updated[index],
      [field]: value,
      dirty: true,
      weightedAvg: calcAvg(
        field === 'score15min' ? value : updated[index].score15min,
        field === 'score1period' ? value : updated[index].score1period,
        field === 'scoreFinal' ? value : updated[index].scoreFinal,
      ),
    }
    setRows(updated)
  }

  const dirtyCount = rows.filter((r) => r.dirty).length

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    setMessage('')
    const dirtyRows = rows.filter((r) => r.dirty)
    for (const row of dirtyRows) {
      await window.api.scores.upsert({
        studentId: row.studentId,
        subjectName: subject,
        subjectWeight:
          subjectOptions.find((s) => s.name === subject)?.weight ?? 1,
        score15min: parseFloat(row.score15min) || null,
        score1period: parseFloat(row.score1period) || null,
        scoreFinal: parseFloat(row.scoreFinal) || null,
        semester,
        academicYear,
        enteredBy: user.id,
      })
    }
    setRows(rows.map((r) => ({ ...r, dirty: false })))
    setMessage(`Đã lưu ${dirtyRows.length} học sinh thành công.`)
    setSaving(false)
  }

  const handleCancel = (): void => {
    setRows(
      rows.map((r) => ({
        ...r,
        score15min: '',
        score1period: '',
        scoreFinal: '',
        weightedAvg: null,
        dirty: false,
      })),
    )
    setMessage('')
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Filter bar */}
      <div className="flex gap-4 mb-6 items-end flex-wrap">
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
        <div>
          <label className="block text-xs text-slate-500 mb-1">Môn học</label>
          <select
            title="Môn học"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
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
        <div>
          <label className="block text-xs text-slate-500 mb-1">Năm học</label>
          <input
            title="Năm học"
            value={academicYear}
            readOnly
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500"
          />
        </div>
        <button
          onClick={loadStudents}
          disabled={loading}
          className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {loading ? 'Đang tải...' : 'Tải danh sách'}
        </button>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
          Không có học sinh nào trong lớp này
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-4 py-3 text-left">STT</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-center">Điểm 15 phút</th>
                <th className="px-4 py-3 text-center">Điểm 1 tiết</th>
                <th className="px-4 py-3 text-center">Cuối kỳ</th>
                <th className="px-4 py-3 text-center">TB môn</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.studentId}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${row.dirty ? 'border-l-4 border-amber-400' : ''}`}
                >
                  <td className="px-4 py-2 text-sm text-slate-500">{i + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium text-slate-700">
                    {row.studentName}
                  </td>
                  {(['score15min', 'score1period', 'scoreFinal'] as const).map(
                    (field) => (
                      <td key={field} className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={row[field]}
                          onChange={(e) =>
                            updateScore(i, field, e.target.value)
                          }
                          className={`w-20 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 ${row.dirty ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}
                          placeholder="—"
                        />
                      </td>
                    ),
                  )}
                  <td className="px-4 py-2 text-center text-sm font-semibold text-slate-700">
                    {row.weightedAvg !== null ? row.weightedAvg : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save bar */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-xl px-6 py-3 flex items-center gap-4 border border-slate-200">
          <span className="text-sm text-slate-600">
            {dirtyCount} thay đổi chưa lưu
          </span>
          <button
            onClick={handleCancel}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? 'Đang lưu...' : 'Lưu tất cả'}
          </button>
        </div>
      )}

      {/* Success message */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          ✓ {message}
        </div>
      )}
    </div>
  )
}
