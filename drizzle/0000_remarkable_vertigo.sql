CREATE TYPE "public"."app_permission" AS ENUM('shifts.create', 'shifts.assign', 'shifts.cancel', 'assignments.respond', 'availability.update');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('owner', 'worker');--> statement-breakpoint
CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('available', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."cancellation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('pending', 'complete', 'cancelled');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"audit_logs_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emergency_cancellation_requests" (
	"emergency_cancellation_request_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shift_assignment_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"reviewed_by" uuid,
	"reason" text NOT NULL,
	"status" "cancellation_status" DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "emergency_cancellation_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "google_calendar_connections" (
	"google_calendar_connections_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_users_id" uuid NOT NULL,
	"provider_account_id" text,
	"refresh_token" text NOT NULL,
	"scopes" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_calendar_connections_auth_users_id_unique" UNIQUE("auth_users_id")
);
--> statement-breakpoint
ALTER TABLE "google_calendar_connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"shift_assignment_id" uuid,
	"notification_type" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "permissions" (
	"permission" "app_permission" PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"employee_number" bigint GENERATED ALWAYS AS IDENTITY (sequence name "profiles_employee_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_number" text,
	"avatar_path" text,
	"account_status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_permissions_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_permissions_role_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"role" "app_role" NOT NULL,
	"permission" "app_permission" NOT NULL,
	CONSTRAINT "role_permissions_role_permission_unique" UNIQUE("role","permission")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "roles" (
	"role" "app_role" PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shift_assignments" (
	"shift_assignment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shift_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"response_status" "assignment_status" DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"google_event_id" text,
	CONSTRAINT "shift_assignments_shift_id_profile_id_unique" UNIQUE("shift_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "shift_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shifts" (
	"shift_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"shift_name" text NOT NULL,
	"shift_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"required_workers" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"status" "shift_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shifts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_roles_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_roles_user_roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"auth_users_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	CONSTRAINT "user_roles_auth_users_id_unique" UNIQUE("auth_users_id")
);
--> statement-breakpoint
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "worker_availability" (
	"worker_availability_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "worker_availability_worker_availability_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"status" "availability_status" DEFAULT 'available' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_availability_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
ALTER TABLE "worker_availability" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "worker_documents" (
	"worker_document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"document_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"document_type" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "worker_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_cancellation_requests" ADD CONSTRAINT "emergency_cancellation_requests_shift_assignment_id_shift_assignments_shift_assignment_id_fk" FOREIGN KEY ("shift_assignment_id") REFERENCES "public"."shift_assignments"("shift_assignment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_cancellation_requests" ADD CONSTRAINT "emergency_cancellation_requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_cancellation_requests" ADD CONSTRAINT "emergency_cancellation_requests_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_calendar_connections" ADD CONSTRAINT "google_calendar_connections_auth_users_id_users_id_fk" FOREIGN KEY ("auth_users_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_shift_assignment_id_shift_assignments_shift_assignment_id_fk" FOREIGN KEY ("shift_assignment_id") REFERENCES "public"."shift_assignments"("shift_assignment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_roles_role_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("role") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_permissions_permission_fk" FOREIGN KEY ("permission") REFERENCES "public"."permissions"("permission") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_shifts_shift_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_auth_users_id_users_id_fk" FOREIGN KEY ("auth_users_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_roles_role_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("role") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_documents" ADD CONSTRAINT "worker_documents_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;