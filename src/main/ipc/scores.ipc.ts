import { ipcMain } from 'electron'
import { db } from '../database/db'
import { scores } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const registerScoresIpc = (): void => {
  // Lấy điểm theo lớp + môn + học kỳ + năm học
  ipcMain.handle(
    'scores:getByClass',
    async (
      _,
      params: {
        className: string
        subjectName: string
        semester: number
        academicYear: string
      },
    ) => {
      const { subjectName, semester, academicYear } = params

      const result = db
        .select({
          studentId: scores.studentId,
          score15min: scores.score15min,
          score1period: scores.score1period,
          scoreFinal: scores.scoreFinal,
          weightedAvg: scores.weightedAvg,
        })
        .from(scores)
        .where(
          and(
            eq(scores.subjectName, subjectName),
            eq(scores.semester, semester),
            eq(scores.academicYear, academicYear),
          ),
        )
        .all()

      return { success: true, data: JSON.parse(JSON.stringify(result)) }
    },
  )

  // Upsert điểm học sinh
  ipcMain.handle(
    'scores:upsert',
    async (
      _,
      params: {
        studentId: string
        subjectName: string
        subjectWeight: number
        score15min: number | null
        score1period: number | null
        scoreFinal: number | null
        semester: number
        academicYear: string
        enteredBy: string
      },
    ) => {
      const now = new Date().toISOString()
      const { studentId, subjectName, semester, academicYear } = params

      // Tính weighted avg
      let weightedAvg: number | null = null
      const s1 = params.score15min
      const s2 = params.score1period
      const s3 = params.scoreFinal
      if (s1 !== null || s2 !== null || s3 !== null) {
        let sum = 0,
          w = 0
        if (s1 !== null) {
          sum += s1 * 1
          w += 1
        }
        if (s2 !== null) {
          sum += s2 * 2
          w += 2
        }
        if (s3 !== null) {
          sum += s3 * 3
          w += 3
        }
        weightedAvg = Math.round((sum / w) * 100) / 100
      }

      // Kiểm tra đã có record chưa
      const existing = db
        .select()
        .from(scores)
        .where(
          and(
            eq(scores.studentId, studentId),
            eq(scores.subjectName, subjectName),
            eq(scores.semester, semester),
            eq(scores.academicYear, academicYear),
          ),
        )
        .get()

      if (existing) {
        // Update
        db.update(scores)
          .set({
            score15min: params.score15min,
            score1period: params.score1period,
            scoreFinal: params.scoreFinal,
            weightedAvg,
            updatedBy: params.enteredBy,
            updatedAt: now,
          })
          .where(eq(scores.id, existing.id))
          .run()
      } else {
        // Insert
        db.insert(scores)
          .values({
            id: randomUUID(),
            studentId,
            subjectName,
            subjectWeight: params.subjectWeight,
            score15min: params.score15min,
            score1period: params.score1period,
            scoreFinal: params.scoreFinal,
            weightedAvg,
            semester,
            academicYear,
            enteredBy: params.enteredBy,
            enteredAt: now,
            updatedBy: null,
            updatedAt: null,
          })
          .run()
      }

      return { success: true }
    },
  )
}
