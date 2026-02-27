import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
// ─── USERS ───────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['student', 'teacher', 'admin'] }).notNull(),
  isSuperAdmin: integer('is_super_admin', { mode: 'boolean' })
    .notNull()
    .default(false),
  isVerified: integer('is_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  verifiedBy: text('verified_by'),
  verificationTimestamp: text('verification_timestamp'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// ─── STUDENTS ────────────────────────────────────────
export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  studentCode: text('student_code').notNull().unique(),
  className: text('class_name').notNull(),
  grade: text('grade').notNull(),
  dateOfBirth: text('date_of_birth'),
  academicYear: text('academic_year').notNull(),
})

// ─── TEACHERS ────────────────────────────────────────
export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  teacherCode: text('teacher_code').notNull().unique(),
})

// ─── SCORES ──────────────────────────────────────────
export const scores = sqliteTable('scores', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  subjectName: text('subject_name').notNull(),
  subjectWeight: real('subject_weight').notNull().default(1.0),
  score15min: real('score_15min'),
  score1period: real('score_1period'),
  scoreFinal: real('score_final'),
  weightedAvg: real('weighted_avg'),
  semester: integer('semester').notNull(),
  academicYear: text('academic_year').notNull(),
  enteredBy: text('entered_by').notNull(),
  enteredAt: text('entered_at').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: text('updated_at'),
})
export const scoresUniqueIdx = uniqueIndex('scores_unique').on(
  scores.studentId,
  scores.subjectName,
  scores.semester,
  scores.academicYear,
)
// ─── SUBJECTS ────────────────────────────────────────
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  weight: real('weight').notNull().default(1.0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
})

// ─── CLASSES ─────────────────────────────────────────
export const classes = sqliteTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  grade: text('grade').notNull(),
  academicYear: text('academic_year').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
})

// ─── ACADEMIC YEARS ──────────────────────────────────
export const academicYears = sqliteTable('academic_years', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull(),
})

// ─── ACADEMIC CRITERIA ───────────────────────────────
export const academicCriteria = sqliteTable('academic_criteria', {
  id: text('id').primaryKey(),
  level: text('level').notNull().unique(),
  minGpa: real('min_gpa').notNull(),
  maxGpa: real('max_gpa').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
