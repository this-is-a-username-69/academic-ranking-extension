import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'path'
import { app } from 'electron'
import { db } from './db'

export const runMigrations = (): void => {
  const migrationsPath = app.isPackaged
    ? join(process.resourcesPath, 'migrations')
    : join(__dirname, '../../src/main/database/migrations')

  migrate(db, { migrationsFolder: migrationsPath })
  console.log('Database migrations completed')
}
