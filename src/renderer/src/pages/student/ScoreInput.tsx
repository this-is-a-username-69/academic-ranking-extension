import React, { useState, useMemo } from 'react'

interface Subject {
  name: string
  weight: number
  score15min: string
  score1period: string
  scoreFinal: string
}

const DEFAULT_SUBJECTS: Subject[] = [
  { name: 'Toán', weight: 2, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Văn', weight: 2, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Anh', weight: 2, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Lý', weight: 1, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Hóa', weight: 1, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Sinh', weight: 1, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Sử', weight: 1, score15min: '', score1period: '', scoreFinal: '' },
  { name: 'Địa', weight: 1, score15min: '', score1period: '', scoreFinal: '' },
]

function calcSubjectAvg(s: Subject): number | null {
  const s1 = parseFloat(s.score15min)
  const s2 = parseFloat(s.score1period)
  const s3 = parseFloat(s.scoreFinal)
  const hasAny = !isNaN(s1) || !isNaN(s2) || !isNaN(s3)
  if (!hasAny) return null
  let sum = 0,
    w = 0
  if (!isNaN(s1)) {
    sum += s1 * 1
    w += 1
  }
  if (!isNaN(s2)) {
    sum += s2 * 2
    w += 2
  }
  if (!isNaN(s3)) {
    sum += s3 * 3
    w += 3
  }
  return Math.round((sum / w) * 100) / 100
}

function getAcademicLevel(gpa: number): { label: string; color: string } {
  if (gpa >= 9.0) return { label: 'Xuất Sắc', color: 'text-emerald-600' }
  if (gpa >= 8.0) return { label: 'Giỏi', color: 'text-blue-600' }
  if (gpa >= 6.5) return { label: 'Khá', color: 'text-amber-600' }
  if (gpa >= 5.0) return { label: 'Trung Bình', color: 'text-orange-600' }
  return { label: 'Yếu', color: 'text-red-600' }
}

interface Props {
  onBack: () => void
}

export default function ScoreInput({ onBack }: Props): React.JSX.Element {
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS)

  const updateScore = (
    index: number,
    field: keyof Subject,
    value: string,
  ): void => {
    if (field === 'name') return
    const num = parseFloat(value)
    if (value !== '' && (isNaN(num) || num < 0 || num > 10)) return
    const updated = [...subjects]
    updated[index] = { ...updated[index], [field]: value }
    setSubjects(updated)
  }

  const gpa = useMemo(() => {
    const valid = subjects
      .map((s) => ({ avg: calcSubjectAvg(s), w: s.weight }))
      .filter((s) => s.avg !== null)
    if (valid.length === 0) return null
    const num = valid.reduce((acc, s) => acc + s.avg! * s.w, 0)
    const den = valid.reduce((acc, s) => acc + s.w, 0)
    return Math.round((num / den) * 100) / 100
  }, [subjects])

  const level = gpa !== null ? getAcademicLevel(gpa) : null

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
        ⚠️ Dữ liệu này chỉ dùng để tham khảo và sẽ không được lưu lại.
      </div>

      <div className="flex gap-6">
        {/* Score table */}
        <div className="flex-1">
          <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-4 py-3 text-left">Môn</th>
                <th className="px-4 py-3 text-center">Hệ số</th>
                <th className="px-4 py-3 text-center">Điểm 15 phút</th>
                <th className="px-4 py-3 text-center">Điểm 1 tiết</th>
                <th className="px-4 py-3 text-center">Cuối kỳ</th>
                <th className="px-4 py-3 text-center">TB môn</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => {
                const avg = calcSubjectAvg(s)
                return (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-slate-700">
                      {s.name}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <select
                        title="Hệ số"
                        value={s.weight}
                        onChange={(e) => {
                          const updated = [...subjects]
                          updated[i] = {
                            ...updated[i],
                            weight: Number(e.target.value),
                          }
                          setSubjects(updated)
                        }}
                        className="border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </td>
                    {(
                      ['score15min', 'score1period', 'scoreFinal'] as const
                    ).map((field) => (
                      <td key={field} className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={s[field]}
                          onChange={(e) =>
                            updateScore(i, field, e.target.value)
                          }
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center text-sm font-semibold text-slate-700">
                      {avg !== null ? avg : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Result panel */}
        <div className="w-52 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center sticky top-0">
            <p className="text-slate-500 text-sm mb-2">Điểm TB</p>
            <p className="text-4xl font-bold text-slate-800">
              {gpa !== null ? gpa : '—'}
            </p>
            {level && (
              <p className={`text-lg font-semibold mt-2 ${level.color}`}>
                {level.label}
              </p>
            )}
          </div>
          <button
            onClick={() => setSubjects(DEFAULT_SUBJECTS.map((s) => ({ ...s })))}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium"
          >
            Xóa tất cả
          </button>
          <button
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
