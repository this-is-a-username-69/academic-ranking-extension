import { db } from './db'
import { users, students, scores } from './schema'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export const runDbTest = async (): Promise<void> => {
  console.log('=== START DB TEST ===')

  // Test 1: Đọc danh sách users
  const allUsers = db.select().from(users).all()
  console.log('Users in DB:', allUsers.length)
  console.log(
    'First user:',
    allUsers[0]?.username,
    '| role:',
    allUsers[0]?.role,
  )

  // Test 2: Insert student user
  const now = new Date().toISOString()
  const studentUserId = randomUUID()
  const studentId = randomUUID()

  db.insert(users)
    .values({
      id: studentUserId,
      username: 'student01',
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
  console.log('Inserted student user OK')

  // Test 3: Insert student profile
  db.insert(students)
    .values({
      id: studentId,
      userId: studentUserId,
      studentCode: 'HS001',
      className: '10A1',
      grade: '10',
      dateOfBirth: '2008-01-01',
      academicYear: '2024-2025',
    })
    .run()
  console.log('Inserted student profile OK')

  // Test 4: Insert score
  db.insert(scores)
    .values({
      id: randomUUID(),
      studentId,
      subjectName: 'Toan',
      subjectWeight: 2.0,
      score15min: 8.5,
      score1period: 7.0,
      scoreFinal: 9.0,
      weightedAvg: null,
      semester: 1,
      academicYear: '2024-2025',
      enteredBy: allUsers[0].id,
      enteredAt: now,
      updatedBy: null,
      updatedAt: null,
    })
    .run()
  console.log('Inserted score OK')

  // Test 5: Đọc lại scores
  const allScores = db.select().from(scores).all()
  console.log('Scores in DB:', allScores.length)
  console.log(
    'Score detail:',
    allScores[0]?.subjectName,
    '| final:',
    allScores[0]?.scoreFinal,
  )

  console.log('=== DB TEST PASSED ===')
}
