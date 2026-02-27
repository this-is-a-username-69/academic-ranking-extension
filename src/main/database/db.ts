import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import * as schema from './schema'

const getDbPath = (): string => {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }
  return join(userDataPath, 'academic-ranking.db')
}

const sqlite = new Database(getDbPath())

// Bật foreign keys
sqlite.pragma('foreign_keys = ON')
// Tăng performance
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
export type DB = typeof db
