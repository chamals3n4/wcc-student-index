CREATE TYPE "public"."house" AS ENUM('Vijaya', 'Gamunu', 'Parakum', 'Thissa');--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "house_name" "house";