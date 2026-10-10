import {
  pgTable,
  pgEnum,
  uuid,
  text,
  bigint,
  integer,
  date,
  time,
  timestamp,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

// ENUMS (values are guesses based on your design, change them to yours)
export const appRole = pgEnum("app_role", ["owner", "worker"]);
export const appPermission = pgEnum("app_permission", [
  "shifts.create",
  "shifts.assign",
  "shifts.cancel",
  "assignments.respond",
  "availability.update",
]);
export const availabilityStatus = pgEnum("availability_status", [
  "available",
  "unavailable",
]);
export const shiftStatus = pgEnum("shift_status", [
  "pending",
  "complete",
  "cancelled",
]);
export const assignmentStatus = pgEnum("assignment_status", [
  "pending",
  "accepted",
  "declined",
]);
export const cancellationStatus = pgEnum("cancellation_status", [
  "pending",
  "approved",
  "rejected",
]);

// ROLES
export const roles = pgTable("roles", {
  role: appRole("role").primaryKey(),
}).enableRLS();

// PERMISSIONS
export const permissions = pgTable("permissions", {
  permission: appPermission("permission").primaryKey(),
}).enableRLS();

// ROLE_PERMISSIONS
export const rolePermissions = pgTable(
  "role_permissions",
  {
    rolePermissionsId: bigint("role_permissions_id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    role: appRole("role")
      .notNull()
      .references(() => roles.role),
    permission: appPermission("permission")
      .notNull()
      .references(() => permissions.permission),
  },
  (t) => [unique().on(t.role, t.permission)],
).enableRLS();

// USER_ROLES
export const userRoles = pgTable("user_roles", {
  userRolesId: bigint("user_roles_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  authUsersId: uuid("auth_users_id")
    .notNull()
    .unique()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  role: appRole("role")
    .notNull()
    .references(() => roles.role),
}).enableRLS();

// GOOGLE_CALENDAR_CONNECTIONS
export const googleCalendarConnections = pgTable(
  "google_calendar_connections",
  {
    googleCalendarConnectionsId: uuid("google_calendar_connections_id")
      .primaryKey()
      .defaultRandom(),
    authUsersId: uuid("auth_users_id")
      .notNull()
      .unique()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id"),
    refreshToken: text("refresh_token").notNull(), // encrypt before saving
    scopes: text("scopes"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
).enableRLS();

// PROFILES
export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  employeeNumber: bigint("employee_number", { mode: "number" })
    .generatedAlwaysAsIdentity()
    .unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  avatarPath: text("avatar_path"),
  accountStatus: text("account_status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// WORKER_AVAILABILITY
export const workerAvailability = pgTable("worker_availability", {
  workerAvailabilityId: bigint("worker_availability_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profileId: uuid("profile_id")
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: "cascade" }),
  status: availabilityStatus("status").notNull().default("available"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// WORKER_DOCUMENTS
export const workerDocuments = pgTable("worker_documents", {
  workerDocumentId: uuid("worker_document_id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  documentName: text("document_name").notNull(),
  storagePath: text("storage_path").notNull(),
  documentType: text("document_type").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// SHIFTS (profile_id = the owner who created the shift)
export const shifts = pgTable("shifts", {
  shiftId: uuid("shift_id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  shiftName: text("shift_name").notNull(),
  shiftDate: date("shift_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  requiredWorkers: integer("required_workers").notNull().default(1),
  notes: text("notes"),
  status: shiftStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// SHIFT_ASSIGNMENTS (profile_id = the worker assigned to the shift)
export const shiftAssignments = pgTable(
  "shift_assignments",
  {
    shiftAssignmentId: uuid("shift_assignment_id").primaryKey().defaultRandom(),
    shiftId: uuid("shift_id")
      .notNull()
      .references(() => shifts.shiftId, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    responseStatus: assignmentStatus("response_status")
      .notNull()
      .default("pending"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    googleEventId: text("google_event_id"), // added: the Google Calendar event
  },
  (t) => [unique().on(t.shiftId, t.profileId)], // added: no double-assigning
).enableRLS();

// NOTIFICATIONS (profile_id = who receives it)
export const notifications = pgTable("notifications", {
  notificationId: uuid("notification_id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  shiftAssignmentId: uuid("shift_assignment_id").references(
    () => shiftAssignments.shiftAssignmentId,
    { onDelete: "cascade" },
  ),
  notificationType: text("notification_type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// EMERGENCY_CANCELLATION_REQUESTS (profile_id = the worker asking to cancel)
export const emergencyCancellationRequests = pgTable(
  "emergency_cancellation_requests",
  {
    emergencyCancellationRequestId: uuid("emergency_cancellation_request_id")
      .primaryKey()
      .defaultRandom(),
    shiftAssignmentId: uuid("shift_assignment_id")
      .notNull()
      .references(() => shiftAssignments.shiftAssignmentId, {
        onDelete: "cascade",
      }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id),
    reason: text("reason").notNull(),
    status: cancellationStatus("status").notNull().default("pending"),
    reviewNotes: text("review_notes"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
).enableRLS();

// AUDIT_LOGS
export const auditLogs = pgTable("audit_logs", {
  auditLogsId: uuid("audit_logs_id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();
