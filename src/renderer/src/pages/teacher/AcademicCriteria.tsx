import React, { useState, useEffect } from 'react'

type Tab = 'criteria' | 'subjects' | 'classes' | 'years'

export default function AcademicCriteria(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('criteria')

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Academic Criteria
      </h2>
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
      {tab === 'criteria' && <CriteriaView />}
      {tab === 'subjects' && <SubjectsView />}
      {tab === 'classes' && <ClassesView />}
      {tab === 'years' && <YearsView />}
    </div>
  )
}

function CriteriaView(): React.JSX.Element {
  const [data, setData] = useState<
    {
      id: string
      level: string
      minGpa: number
      maxGpa: number
      description?: string
    }[]
  >([])

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.criteria.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800 text-white text-sm">
            <th className="px-4 py-3 text-left">Xếp loại</th>
            <th className="px-4 py-3 text-center">GPA tối thiểu</th>
            <th className="px-4 py-3 text-center">GPA tối đa</th>
            <th className="px-4 py-3 text-left">Mô tả</th>
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
                {row.level}
              </td>
              <td className="px-4 py-3 text-center text-sm">{row.minGpa}</td>
              <td className="px-4 py-3 text-center text-sm">{row.maxGpa}</td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {row.description ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SubjectsView(): React.JSX.Element {
  const [data, setData] = useState<
    { id: string; name: string; weight: number }[]
  >([])

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.subjects.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800 text-white text-sm">
            <th className="px-4 py-3 text-left">Môn học</th>
            <th className="px-4 py-3 text-center">Hệ số</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center text-slate-400 py-8">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClassesView(): React.JSX.Element {
  const [data, setData] = useState<
    { id: string; name: string; grade: string; academicYear: string }[]
  >([])

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.classes.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800 text-white text-sm">
            <th className="px-4 py-3 text-left">Tên lớp</th>
            <th className="px-4 py-3 text-center">Khối</th>
            <th className="px-4 py-3 text-center">Năm học</th>
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
              <td className="px-4 py-3 text-center text-sm">{row.grade}</td>
              <td className="px-4 py-3 text-center text-sm">
                {row.academicYear}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function YearsView(): React.JSX.Element {
  const [data, setData] = useState<
    {
      id: string
      name: string
      startDate: string
      endDate: string
      isCurrent: boolean
    }[]
  >([])

  useEffect(() => {
    const load = async (): Promise<void> => {
      const result = await window.api.academicYears.getAll()
      if (result.success && result.data) setData(result.data)
    }
    load()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800 text-white text-sm">
            <th className="px-4 py-3 text-left">Năm học</th>
            <th className="px-4 py-3 text-center">Bắt đầu</th>
            <th className="px-4 py-3 text-center">Kết thúc</th>
            <th className="px-4 py-3 text-center">Hiện tại</th>
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
              <td className="px-4 py-3 text-center text-sm">{row.startDate}</td>
              <td className="px-4 py-3 text-center text-sm">{row.endDate}</td>
              <td className="px-4 py-3 text-center">
                {row.isCurrent && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                    Hiện tại
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
