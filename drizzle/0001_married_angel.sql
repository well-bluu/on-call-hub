ALTER TABLE "shifts" ADD COLUMN "shift_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shifts" DROP COLUMN "created_at";