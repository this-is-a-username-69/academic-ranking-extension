import { ipcMain } from 'electron'
import { db } from '../database/db'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { users, students } from '../database/schema'

export const registerUsersIpc = (): void => {
  // Lấy tất cả users
  ipcMain.handle('users:getAll', async () => {
    const result = db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isSuperAdmin: users.isSuperAdmin,
        isVerified: users.isVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .all()
    return { success: true, data: result }
  })

  // Tạo tài khoản mới
  ipcMain.handle(
    'users:create',
    async (
      _,
      params: {
        username: string
        password: string
        fullName: string
        role: 'student' | 'teacher' | 'admin'
        className?: string
      },
    ) => {
      const existing = db
        .select()
        .from(users)
        .where(eq(users.username, params.username))
        .get()
      if (existing) return { success: false, error: 'Username đã tồn tại' }

      const now = new Date().toISOString()
      const userId = randomUUID()
      const passwordHash = await bcrypt.hash(params.password, 10)

      db.insert(users)
        .values({
          id: userId,
          username: params.username,
          passwordHash,
          fullName: params.fullName,
          role: params.role,
          isSuperAdmin: false,
          isVerified: params.role !== 'admin',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .run()

      // Tạo student profile nếu role = student
      if (params.role === 'student' && params.className) {
        const studentCode = `HS${Date.now().toString().slice(-6)}`
        db.insert(students)
          .values({
            id: randomUUID(),
            userId,
            studentCode,
            className: params.className,
            grade: params.className.slice(0, 2),
            academicYear: '2024-2025',
            dateOfBirth: null,
          })
          .run()
      }

      return { success: true }
    },
  )

  // Khóa / mở khóa tài khoản
  ipcMain.handle(
    'users:toggleLock',
    async (_, params: { userId: string; requesterId: string }) => {
      const user = db
        .select()
        .from(users)
        .where(eq(users.id, params.userId))
        .get()
      if (!user) return { success: false, error: 'Không tìm thấy tài khoản' }
      if (user.isSuperAdmin)
        return { success: false, error: 'Không thể khóa Super Admin' }

      // Chỉ Super Admin mới được khóa admin khác
      const requester = db
        .select()
        .from(users)
        .where(eq(users.id, params.requesterId))
        .get()
      if (user.role === 'admin' && !requester?.isSuperAdmin) {
        return {
          success: false,
          error: 'Chỉ Super Admin mới có thể khóa tài khoản Admin',
        }
      }

      db.update(users)
        .set({
          isActive: !user.isActive,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, params.userId))
        .run()

      return { success: true }
    },
  )

  // Xóa tài khoản
  ipcMain.handle(
    'users:delete',
    async (_, params: { userId: string; requesterId: string }) => {
      const user = db
        .select()
        .from(users)
        .where(eq(users.id, params.userId))
        .get()
      if (!user) return { success: false, error: 'Không tìm thấy tài khoản' }
      if (user.isSuperAdmin)
        return { success: false, error: 'Không thể xóa Super Admin' }

      const requester = db
        .select()
        .from(users)
        .where(eq(users.id, params.requesterId))
        .get()
      if (user.role === 'admin' && !requester?.isSuperAdmin) {
        return {
          success: false,
          error: 'Chỉ Super Admin mới có thể xóa tài khoản Admin',
        }
      }

      db.delete(users).where(eq(users.id, params.userId)).run()
      return { success: true }
    },
  )
  // Verify admin (chỉ Super Admin)
  ipcMain.handle(
    'users:verify',
    async (_, params: { userId: string; verifiedBy: string }) => {
      const now = new Date().toISOString()
      db.update(users)
        .set({
          isVerified: true,
          verifiedBy: params.verifiedBy,
          verificationTimestamp: now,
          updatedAt: now,
        })
        .where(eq(users.id, params.userId))
        .run()

      return { success: true }
    },
  )
}
