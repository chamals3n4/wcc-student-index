ALTER TABLE "students" RENAME COLUMN "parent_contact" TO "contact_no";
ALTER TABLE "students" ADD COLUMN "guardian_name" varchar(255);
ALTER TABLE "students" ADD COLUMN "siblings_at_school" text;
ALTER TABLE "students" DROP COLUMN "guardian_contact";
