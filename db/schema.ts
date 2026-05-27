import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
} from "drizzle-orm/pg-core"

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  imageUrl: text("image_url"),

  indexNumber: varchar("index_number", {
    length: 100,
  })
    .notNull()
    .unique(),

  address: text("address").notNull(),

  birthDay: date("birth_day").notNull(),

  currentGrade: varchar("current_grade", {
    length: 50,
  }).notNull(),

  specialRemarks: text("special_remarks"),

  contactNo: varchar("contact_no", {
    length: 20,
  }).notNull(),

  guardianName: varchar("guardian_name", {
    length: 255,
  }),

  siblingsAtSchool: text("siblings_at_school"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})
