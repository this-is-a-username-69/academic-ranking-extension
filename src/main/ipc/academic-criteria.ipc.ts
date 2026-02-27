import { ipcMain } from 'electron'
import { db } from '../database/db'
import {
  academicCriteria,
  subjects,
  classes,
  academicYears,
} from '../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const registerAcademicCriteriaIpc = (): void => {
  // ── ACADEMIC CRITERIA ──
  ipcMain.handle('criteria:getAll', async () => {
    const data = db.select().from(academicCriteria).all()
    return { success: true, data }
  })

  ipcMain.handle(
    'criteria:upsert',
    async (
      _,
      params: {
        id?: string
        level: string
        minGpa: number
        maxGpa: number
        description?: string
      },
    ) => {
      const now = new Date().toISOString()
      if (params.id) {
        db.update(academicCriteria)
          .set({
            level: params.level,
            minGpa: params.minGpa,
            maxGpa: params.maxGpa,
            description: params.description ?? null,
            updatedAt: now,
          })
          .where(eq(academicCriteria.id, params.id))
          .run()
      } else {
        db.insert(academicCriteria)
          .values({
            id: randomUUID(),
            level: params.level,
            minGpa: params.minGpa,
            maxGpa: params.maxGpa,
            description: params.description ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .run()
      }
      return { success: true }
    },
  )

  ipcMain.handle('criteria:delete', async (_, params: { id: string }) => {
    db.delete(academicCriteria).where(eq(academicCriteria.id, params.id)).run()
    return { success: true }
  })

  // ── SUBJECTS ──
  ipcMain.handle('subjects:getAll', async () => {
    const data = db.select().from(subjects).all()
    return { success: true, data }
  })

  ipcMain.handle(
    'subjects:upsert',
    async (
      _,
      params: {
        id?: string
        name: string
        weight: number
      },
    ) => {
      const now = new Date().toISOString()
      if (params.id) {
        db.update(subjects)
          .set({
            name: params.name,
            weight: params.weight,
          })
          .where(eq(subjects.id, params.id))
          .run()
      } else {
        db.insert(subjects)
          .values({
            id: randomUUID(),
            name: params.name,
            weight: params.weight,
            isActive: true,
            createdAt: now,
          })
          .run()
      }
      return { success: true }
    },
  )

  ipcMain.handle('subjects:delete', async (_, params: { id: string }) => {
    db.delete(subjects).where(eq(subjects.id, params.id)).run()
    return { success: true }
  })

  // ── CLASSES ──
  ipcMain.handle('classes:getAll', async () => {
    const data = db.select().from(classes).all()
    const sorted = data.sort((a, b) => {
      // Tách grade (10/11/12), letter (A/B/C), number (1-10)
      const parse = (name: string): [number, string, number] => {
        const match = name.match(/^(\d+)([A-Z]+)(\d+)$/)
        if (!match) return [0, '', 0]
        return [parseInt(match[1]), match[2], parseInt(match[3])]
      }
      const [g1, l1, n1] = parse(a.name)
      const [g2, l2, n2] = parse(b.name)
      if (g1 !== g2) return g1 - g2
      if (l1 !== l2) return l1.localeCompare(l2)
      return n1 - n2
    })
    return { success: true, data: JSON.parse(JSON.stringify(sorted)) }
  })

  ipcMain.handle(
    'classes:upsert',
    async (
      _,
      params: {
        id?: string
        name: string
        grade: string
        academicYear: string
      },
    ) => {
      const now = new Date().toISOString()
      if (params.id) {
        db.update(classes)
          .set({
            name: params.name,
            grade: params.grade,
            academicYear: params.academicYear,
          })
          .where(eq(classes.id, params.id))
          .run()
      } else {
        db.insert(classes)
          .values({
            id: randomUUID(),
            name: params.name,
            grade: params.grade,
            academicYear: params.academicYear,
            isActive: true,
            createdAt: now,
          })
          .run()
      }
      return { success: true }
    },
  )

  ipcMain.handle('classes:delete', async (_, params: { id: string }) => {
    db.delete(classes).where(eq(classes.id, params.id)).run()
    return { success: true }
  })

  // ── ACADEMIC YEARS ──
  ipcMain.handle('academicYears:getAll', async () => {
    const data = db.select().from(academicYears).all()
    return { success: true, data }
  })

  ipcMain.handle(
    'academicYears:upsert',
    async (
      _,
      params: {
        id?: string
        name: string
        startDate: string
        endDate: string
        isCurrent: boolean
      },
    ) => {
      const now = new Date().toISOString()
      if (params.isCurrent) {
        // Reset tất cả về false trước
        db.update(academicYears).set({ isCurrent: false }).run()
      }
      if (params.id) {
        db.update(academicYears)
          .set({
            name: params.name,
            startDate: params.startDate,
            endDate: params.endDate,
            isCurrent: params.isCurrent,
          })
          .where(eq(academicYears.id, params.id))
          .run()
      } else {
        db.insert(academicYears)
          .values({
            id: randomUUID(),
            name: params.name,
            startDate: params.startDate,
            endDate: params.endDate,
            isCurrent: params.isCurrent,
            createdAt: now,
          })
          .run()
      }
      return { success: true }
    },
  )

  ipcMain.handle('academicYears:delete', async (_, params: { id: string }) => {
    db.delete(academicYears).where(eq(academicYears.id, params.id)).run()
    return { success: true }
  })
  ipcMain.handle(
    'classes:deleteByYear',
    async (_, params: { academicYear: string }) => {
      db.delete(classes)
        .where(eq(classes.academicYear, params.academicYear))
        .run()
      return { success: true }
    },
  )
}
