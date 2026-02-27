import { ipcMain } from 'electron'
import { db } from '../database/db'
import { students, users } from '../database/schema'
import { eq } from 'drizzle-orm'

export const registerStudentsIpc = (): void => {
  ipcMain.handle(
    'students:getByClass',
    async (_, params: { className: string }) => {
      const { className } = params

      const studentList = db
        .select()
        .from(students)
        .where(eq(students.className, className))
        .all()

      const result = studentList.map((stu) => {
        const user = db
          .select()
          .from(users)
          .where(eq(users.id, stu.userId))
          .get()
        return {
          studentId: stu.id,
          studentName: user?.fullName ?? 'Unknown',
          studentCode: stu.studentCode,
          className: stu.className,
        }
      })

      return { success: true, data: result }
    },
  )
  ipcMain.handle('students:getAll', async () => {
    const studentList = db.select().from(students).all()
    return { success: true, data: studentList }
  })
}
