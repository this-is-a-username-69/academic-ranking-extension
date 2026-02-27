import { db } from './db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { users, students, subjects, classes, academicYears } from './schema'

export const seedSuperAdmin = async (): Promise<void> => {
  const existing = db.select().from(users).all()
  if (existing.length > 0) {
    console.log('Database already seeded, skipping...')
    return
  }

  const now = new Date().toISOString()

  // Super Admin
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'superadmin',
      passwordHash: await bcrypt.hash('admin123', 12),
      fullName: 'Super Admin',
      role: 'admin',
      isSuperAdmin: true,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  // Admin thường
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'admin01',
      passwordHash: await bcrypt.hash('admin456', 12),
      fullName: 'Tran Thi Admin',
      role: 'admin',
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  // Teacher
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'teacher01',
      passwordHash: await bcrypt.hash('teacher123', 12),
      fullName: 'Nguyen Thi B',
      role: 'teacher',
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  // Student user
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'student01',
      passwordHash: await bcrypt.hash('student123', 12),
      fullName: 'Tran Van C',
      role: 'student',
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  // Student profile — sau khi đã insert student user
  const studentUser = db
    .select()
    .from(users)
    .where(eq(users.username, 'student01'))
    .get()
  if (studentUser) {
    db.insert(students)
      .values({
        id: randomUUID(),
        userId: studentUser.id,
        studentCode: 'HS001',
        className: '10A1',
        grade: '10',
        dateOfBirth: '2008-01-01',
        academicYear: '2024-2025',
      })
      .run()
  }

  // Student 2
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'student02',
      passwordHash: await bcrypt.hash('student123', 12),
      fullName: 'Nguyen Van A',
      role: 'student',
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  const studentUser2 = db
    .select()
    .from(users)
    .where(eq(users.username, 'student02'))
    .get()
  if (studentUser2) {
    db.insert(students)
      .values({
        id: randomUUID(),
        userId: studentUser2.id,
        studentCode: 'HS002',
        className: '10A1',
        grade: '10',
        dateOfBirth: '2008-03-15',
        academicYear: '2024-2025',
      })
      .run()
  }

  // Student 3
  db.insert(users)
    .values({
      id: randomUUID(),
      username: 'student03',
      passwordHash: await bcrypt.hash('student123', 12),
      fullName: 'Le Thi D',
      role: 'student',
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      verifiedBy: null,
      verificationTimestamp: null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  const studentUser3 = db
    .select()
    .from(users)
    .where(eq(users.username, 'student03'))
    .get()
  if (studentUser3) {
    db.insert(students)
      .values({
        id: randomUUID(),
        userId: studentUser3.id,
        studentCode: 'HS003',
        className: '10A1',
        grade: '10',
        dateOfBirth: '2008-05-20',
        academicYear: '2024-2025',
      })
      .run()
  }
  // Seed subjects
  const existingSubjects = db.select().from(subjects).all()
  if (existingSubjects.length === 0) {
    const defaultSubjects = [
      { name: 'Toán', weight: 2 },
      { name: 'Ngữ Văn', weight: 2 },
      { name: 'Tiếng Anh', weight: 2 },
      { name: 'Vật Lý', weight: 1 },
      { name: 'Hóa Học', weight: 1 },
      { name: 'Sinh Học', weight: 1 },
      { name: 'Lịch Sử', weight: 1 },
      { name: 'Địa Lý', weight: 1 },
      { name: 'GDCD', weight: 1 },
      { name: 'Tin Học', weight: 1 },
      { name: 'Thể Dục', weight: 1 },
    ]
    for (const s of defaultSubjects) {
      db.insert(subjects)
        .values({
          id: randomUUID(),
          name: s.name,
          weight: s.weight,
          isActive: true,
          createdAt: now,
        })
        .run()
    }
    // Seed classes - mặc định 10 lớp mỗi khối, ký tự A
    const existingClasses = db.select().from(classes).all()
    if (existingClasses.length === 0) {
      for (const grade of ['10', '11', '12']) {
        for (let i = 1; i <= 10; i++) {
          db.insert(classes)
            .values({
              id: randomUUID(),
              name: `${grade}A${i}`,
              grade,
              academicYear: '2024-2025',
              isActive: true,
              createdAt: now,
            })
            .run()
        }
      }
    }

    // Seed academic years
    const existingYears = db.select().from(academicYears).all()
    if (existingYears.length === 0) {
      const defaultYears = [
        {
          name: '2023-2024',
          startDate: '2023-09-05',
          endDate: '2024-05-31',
          isCurrent: false,
        },
        {
          name: '2024-2025',
          startDate: '2024-09-05',
          endDate: '2025-05-31',
          isCurrent: true,
        },
        {
          name: '2025-2026',
          startDate: '2025-09-05',
          endDate: '2026-05-31',
          isCurrent: false,
        },
      ]
      for (const y of defaultYears) {
        db.insert(academicYears)
          .values({
            id: randomUUID(),
            name: y.name,
            startDate: y.startDate,
            endDate: y.endDate,
            isCurrent: y.isCurrent,
            createdAt: now,
          })
          .run()
      }
    }
  }
  console.log('Seeded: superadmin / admin123')
  console.log('Seeded: admin01 / admin456')
  console.log('Seeded: teacher01 / teacher123')
  console.log('Seeded: student01 / student123')
  console.log('Seeded: student02 / student123')
  console.log('Seeded: student03 / student123')
}
