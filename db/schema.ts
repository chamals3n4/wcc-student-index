import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  smallint,
  pgEnum,
} from "drizzle-orm/pg-core"

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "transferred",
  "left",
])

export const streamEnum = pgEnum("stream", ["Maths", "Bio", "Commerce", "Art"])

// class = specific grade + section + academic year combination.
// e.g. Grade 10-A in 2026, or Grade 12 Maths-M1 in 2026
export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  academicYear: varchar("academic_year", { length: 9 }).notNull(), // "2026"
  grade: smallint("grade").notNull(), // 1-13
  section: varchar("section", { length: 10 }).notNull(), // "A", "B", "M1", "B2"

  // null for grades 1-11, required for grades 12-13
  stream: streamEnum("stream"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  asgardeoUserId: varchar("asgardeo_user_id", { length: 255 })
    .notNull()
    .unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// which teacher is assigned to which class
export const classTeachers = pgTable("class_teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
})

// students core
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  indexNumber: varchar("index_number", { length: 100 }).notNull().unique(),
  address: text("address").notNull(),
  birthDay: date("birth_day").notNull(),
  specialRemarks: text("special_remarks"),
  contactNo: varchar("contact_no", { length: 20 }).notNull(),
  guardianName: varchar("guardian_name", { length: 255 }),
  siblingsAtSchool: text("siblings_at_school"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// connects a student to a class in a given year.
export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "restrict" }),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
})
