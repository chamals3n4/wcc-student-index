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

  parentContact: varchar("parent_contact", {
    length: 20,
  }).notNull(),

  guardianContact: varchar("guardian_contact", {
    length: 20,
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})
