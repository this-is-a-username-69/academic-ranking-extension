import { ipcMain } from 'electron'
import { db } from '../database/db'
import { users } from '../database/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const registerAuthIpc = (): void => {
  ipcMain.handle(
    'auth:login',
    async (_, credentials: { username: string; password: string }) => {
      const { username, password } = credentials

      // Tìm user theo username
      const user = db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .get()

      if (!user) {
        return { success: false, error: 'Tên đăng nhập không tồn tại' }
      }

      if (!user.isActive) {
        return { success: false, error: 'Tài khoản đã bị khóa' }
      }

      if (!user.isVerified) {
        return { success: false, error: 'Tài khoản chưa được xác minh' }
      }

      // So sánh password
      const isMatch = await bcrypt.compare(password, user.passwordHash)
      if (!isMatch) {
        return { success: false, error: 'Mật khẩu không đúng' }
      }

      // Trả về thông tin user (không trả password hash)
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
        },
      }
    },
  )
}
