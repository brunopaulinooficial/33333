import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  decimal,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  isOnboarded: boolean("is_onboarded").default(false),
  authProvider: varchar("auth_provider").default("local"), // 'local' or 'replit'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyEntries = pgTable("daily_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  rides: integer("rides").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const monthlyStats = pgTable("monthly_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: varchar("month").notNull(), // YYYY-MM format
  totalRides: integer("total_rides").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalFuelCost: decimal("total_fuel_cost", { precision: 10, scale: 2 }).default("0"),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).default("6000"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueUserMonth: index("monthly_stats_user_month_idx").on(table.userId, table.month),
}));

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'champion', 'veteran', 'goal_100', etc.
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  dailyEntries: many(dailyEntries),
  monthlyStats: many(monthlyStats),
  achievements: many(achievements),
}));

export const dailyEntriesRelations = relations(dailyEntries, ({ one }) => ({
  user: one(users, {
    fields: [dailyEntries.userId],
    references: [users.id],
  }),
}));

export const monthlyStatsRelations = relations(monthlyStats, ({ one }) => ({
  user: one(users, {
    fields: [monthlyStats.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyStatsSchema = createInsertSchema(monthlyStats).omit({
  id: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type InsertMonthlyStats = z.infer<typeof insertMonthlyStatsSchema>;
export type MonthlyStats = typeof monthlyStats.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
