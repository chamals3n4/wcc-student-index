CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"image_url" text,
	"index_number" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"birth_day" date NOT NULL,
	"current_grade" varchar(50) NOT NULL,
	"special_remarks" text,
	"parent_contact" varchar(20) NOT NULL,
	"guardian_contact" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_index_number_unique" UNIQUE("index_number")
);
