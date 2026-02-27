import { ipcMain } from 'electron'
import { db } from '../database/db'
import { scores, users, students } from '../database/schema'
import { eq, and } from 'drizzle-orm'

interface RankEntry {
  rank: number
  studentId: string
  studentName: string
  className: string
  gpa: number
  academicLevel: string
}

function getAcademicLevel(gpa: number): string {
  if (gpa >= 9.0) return 'Xuất Sắc'
  if (gpa >= 8.0) return 'Giỏi'
  if (gpa >= 6.5) return 'Khá'
  if (gpa >= 5.0) return 'Trung Bình'
  return 'Yếu'
}

function calcGPA(
  studentScores: { weightedAvg: number | null; subjectWeight: number }[],
): number | null {
  const valid = studentScores.filter((s) => s.weightedAvg !== null)
  if (valid.length === 0) return null
  const num = valid.reduce(
    (acc, s) => acc + s.weightedAvg! * s.subjectWeight,
    0,
  )
  const den = valid.reduce((acc, s) => acc + s.subjectWeight, 0)
  return Math.round((num / den) * 100) / 100
}

export const registerRankingIpc = (): void => {
  // Ranking theo lớp
  ipcMain.handle(
    'ranking:getClass',
    async (
      _,
      params: {
        className: string
        semester: number
        academicYear: string
      },
    ) => {
      const { className, semester, academicYear } = params

      // Lấy tất cả students trong lớp
      const studentList = db
        .select()
        .from(students)
        .where(eq(students.className, className))
        .all()

      if (studentList.length === 0) return { success: true, data: [] }

      const entries: RankEntry[] = []

      for (const stu of studentList) {
        // Lấy user info
        const user = db
          .select()
          .from(users)
          .where(eq(users.id, stu.userId))
          .get()
        if (!user) continue

        // Lấy scores
        const stuScores = db
          .select()
          .from(scores)
          .where(
            and(
              eq(scores.studentId, stu.id),
              eq(scores.semester, semester),
              eq(scores.academicYear, academicYear),
            ),
          )
          .all()

        const gpa = calcGPA(
          stuScores.map((s) => ({
            weightedAvg: s.weightedAvg,
            subjectWeight: s.subjectWeight,
          })),
        )

        if (gpa === null) continue

        entries.push({
          studentId: stu.id,
          studentName: user.fullName,
          className: stu.className,
          gpa,
          academicLevel: getAcademicLevel(gpa),
          rank: 0,
        })
      }

      // Sort và gán rank
      entries.sort((a, b) => b.gpa - a.gpa)
      entries.forEach((e, i) => {
        e.rank = i + 1
      })

      return { success: true, data: entries }
    },
  )

  // Ranking toàn trường
  ipcMain.handle(
    'ranking:getSchool',
    async (
      _,
      params: {
        semester: number
        academicYear: string
      },
    ) => {
      const { semester, academicYear } = params

      const studentList = db.select().from(students).all()
      if (studentList.length === 0) return { success: true, data: [] }

      const entries: RankEntry[] = []

      for (const stu of studentList) {
        const user = db
          .select()
          .from(users)
          .where(eq(users.id, stu.userId))
          .get()
        if (!user) continue

        const stuScores = db
          .select()
          .from(scores)
          .where(
            and(
              eq(scores.studentId, stu.id),
              eq(scores.semester, semester),
              eq(scores.academicYear, academicYear),
            ),
          )
          .all()

        const gpa = calcGPA(
          stuScores.map((s) => ({
            weightedAvg: s.weightedAvg,
            subjectWeight: s.subjectWeight,
          })),
        )

        if (gpa === null) continue

        entries.push({
          studentId: stu.id,
          studentName: user.fullName,
          className: stu.className,
          gpa,
          academicLevel: getAcademicLevel(gpa),
          rank: 0,
        })
      }

      entries.sort((a, b) => b.gpa - a.gpa)
      entries.forEach((e, i) => {
        e.rank = i + 1
      })

      return { success: true, data: entries }
    },
  )
}
