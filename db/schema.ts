import {
  pgTable,
  uuid,
  text,
  date,
  time,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

// OWNER
export const owners = pgTable("owners", {
  ownerId: uuid("owner_id").primaryKey().defaultRandom(),
  authId: uuid("auth_id")
    .notNull()
    .unique()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullname: text("fullname").notNull(),
  contactNumber: text("contact_number"),
}).enableRLS();

// WORKER
export const workers = pgTable("workers", {
  workerId: uuid("worker_id").primaryKey().defaultRandom(),
  authId: uuid("auth_id")
    .notNull()
    .unique()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullname: text("fullname").notNull(),
  contactNumber: text("contact_number"),
}).enableRLS();

// SHIFT
export const shifts = pgTable("shifts", {
  shiftId: uuid("shift_id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => owners.ownerId),
  shiftName: text("shift_name").notNull(),
  shiftDate: date("shift_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  status: text("status").notNull().default("open"),
}).enableRLS();

// SHIFT_ASSIGNMENT
export const shiftAssignments = pgTable(
  "shift_assignments",
  {
    assignmentId: uuid("assignment_id").primaryKey().defaultRandom(),
    workerId: uuid("worker_id")
      .notNull()
      .references(() => workers.workerId),
    shiftId: uuid("shift_id")
      .notNull()
      .references(() => shifts.shiftId, { onDelete: "cascade" }),
    responseStatus: text("response_status").notNull().default("pending"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    googleEventId: text("google_event_id"), // added: the Google Calendar event
  },
  (t) => [unique().on(t.shiftId, t.workerId)], // added: no double-assigning
).enableRLS();

// NOTIFICATION
export const notifications = pgTable("notifications", {
  notificationId: uuid("notification_id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => shiftAssignments.assignmentId, { onDelete: "cascade" }),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workers.workerId),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => owners.ownerId),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
}).enableRLS();

// AVAILABILITY
export const availability = pgTable("availability", {
  availabilityId: uuid("availability_id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workers.workerId, { onDelete: "cascade" }),
  status: text("status").notNull().default("available"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

// GOOGLE TOKENS (added: for Calendar)
export const googleTokens = pgTable("google_tokens", {
  authId: uuid("auth_id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull(), // encrypt before saving
}).enableRLS();
