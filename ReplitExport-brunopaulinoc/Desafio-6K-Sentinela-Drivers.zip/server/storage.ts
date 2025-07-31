import {
  users,
  dailyEntries,
  monthlyStats,
  achievements,
  type User,
  type UpsertUser,
  type InsertDailyEntry,
  type DailyEntry,
  type InsertMonthlyStats,
  type MonthlyStats,
  type InsertAchievement,
  type Achievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, displayName: string, profileImageUrl?: string): Promise<User>;
  markUserOnboarded(id: string): Promise<User>;
  
  // Daily entry operations
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  getDailyEntry(userId: string, date: string): Promise<DailyEntry | undefined>;
  updateDailyEntry(id: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry>;
  getUserDailyEntries(userId: string): Promise<DailyEntry[]>;
  
  // Monthly stats operations
  getOrCreateMonthlyStats(userId: string, month: string): Promise<MonthlyStats>;
  updateMonthlyStats(userId: string, month: string): Promise<MonthlyStats>;
  getMonthlyRanking(month: string): Promise<Array<MonthlyStats & { user: User }>>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async updateUserProfile(id: string, displayName: string, profileImageUrl?: string): Promise<User> {
    const updateData: any = {
      displayName,
      updatedAt: new Date(),
    };
    
    if (profileImageUrl) {
      updateData.profileImageUrl = profileImageUrl;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async markUserOnboarded(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isOnboarded: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Daily entry operations
  async createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const [dailyEntry] = await db
      .insert(dailyEntries)
      .values(entry)
      .returning();
    
    // Update monthly stats after creating daily entry
    const month = entry.date.substring(0, 7); // Extract YYYY-MM
    await this.updateMonthlyStats(entry.userId, month);
    
    // Check and award achievements
    await this.checkAndAwardAchievements(entry.userId, month);
    
    return dailyEntry;
  }

  async getDailyEntry(userId: string, date: string): Promise<DailyEntry | undefined> {
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date)));
    return entry;
  }

  async updateDailyEntry(id: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry> {
    const [updatedEntry] = await db
      .update(dailyEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(dailyEntries.id, id))
      .returning();
    
    // Update monthly stats after updating daily entry
    if (updatedEntry.date) {
      const month = updatedEntry.date.substring(0, 7);
      await this.updateMonthlyStats(updatedEntry.userId, month);
      
      // Check and award achievements
      await this.checkAndAwardAchievements(updatedEntry.userId, month);
    }
    
    return updatedEntry;
  }

  async getUserDailyEntries(userId: string): Promise<DailyEntry[]> {
    return await db
      .select()
      .from(dailyEntries)
      .where(eq(dailyEntries.userId, userId))
      .orderBy(desc(dailyEntries.date));
  }

  // Monthly stats operations
  async getOrCreateMonthlyStats(userId: string, month: string): Promise<MonthlyStats> {
    const [existing] = await db
      .select()
      .from(monthlyStats)
      .where(and(eq(monthlyStats.userId, userId), eq(monthlyStats.month, month)));

    if (existing) {
      return existing;
    }

    const [newStats] = await db
      .insert(monthlyStats)
      .values({
        userId,
        month,
        totalRides: 0,
        totalRevenue: "0",
        totalFuelCost: "0",
        goalAmount: "6000",
      })
      .returning();

    return newStats;
  }

  async updateMonthlyStats(userId: string, month: string): Promise<MonthlyStats> {
    // Calculate totals from daily entries for this month
    const entries = await db
      .select()
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.userId, userId),
          sql`${dailyEntries.date} LIKE ${month + '%'}`
        )
      );

    const totalRides = entries.reduce((sum, entry) => sum + entry.rides, 0);
    const totalRevenue = entries.reduce((sum, entry) => sum + parseFloat(entry.revenue), 0);
    const totalFuelCost = entries.reduce((sum, entry) => sum + parseFloat(entry.fuelCost), 0);

    // First try to update existing record
    const existingStats = await db
      .select()
      .from(monthlyStats)
      .where(and(eq(monthlyStats.userId, userId), eq(monthlyStats.month, month)))
      .limit(1);

    if (existingStats.length > 0) {
      const [stats] = await db
        .update(monthlyStats)
        .set({
          totalRides,
          totalRevenue: totalRevenue.toString(),
          totalFuelCost: totalFuelCost.toString(),
          updatedAt: new Date(),
        })
        .where(and(eq(monthlyStats.userId, userId), eq(monthlyStats.month, month)))
        .returning();
      return stats;
    } else {
      // Create new record
      const [stats] = await db
        .insert(monthlyStats)
        .values({
          userId,
          month,
          totalRides,
          totalRevenue: totalRevenue.toString(),
          totalFuelCost: totalFuelCost.toString(),
          goalAmount: "6000",
        })
        .returning();
      return stats;
    }
  }

  async getMonthlyRanking(month: string): Promise<Array<MonthlyStats & { user: User }>> {
    const ranking = await db
      .select({
        id: monthlyStats.id,
        userId: monthlyStats.userId,
        month: monthlyStats.month,
        totalRides: monthlyStats.totalRides,
        totalRevenue: monthlyStats.totalRevenue,
        totalFuelCost: monthlyStats.totalFuelCost,
        goalAmount: monthlyStats.goalAmount,
        updatedAt: monthlyStats.updatedAt,
        user: users,
      })
      .from(monthlyStats)
      .innerJoin(users, eq(monthlyStats.userId, users.id))
      .where(eq(monthlyStats.month, month))
      .orderBy(desc(monthlyStats.totalRevenue));

    return ranking;
  }

  // Achievement operations
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    // Check if achievement already exists
    const existingAchievement = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, achievement.userId),
          eq(achievements.type, achievement.type)
        )
      )
      .limit(1);

    if (existingAchievement.length > 0) {
      return existingAchievement[0];
    }

    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async checkAndAwardAchievements(userId: string, month: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    // Get monthly stats for the user
    const stats = await this.getOrCreateMonthlyStats(userId, month);
    
    // Get daily entries for the month to check working days
    const entries = await db
      .select()
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.userId, userId),
          sql`${dailyEntries.date} LIKE ${month + '%'}`
        )
      );

    // Check for 100 rides achievement
    if (stats.totalRides >= 100) {
      try {
        const achievement = await this.createAchievement({
          userId,
          type: 'rides_100',
        });
        if (achievement) {
          newAchievements.push(achievement);
        }
      } catch (error) {
        // Achievement already exists, ignore
      }
    }

    // Check for 30 working days achievement
    if (entries.length >= 30) {
      try {
        const achievement = await this.createAchievement({
          userId,
          type: 'days_30',
        });
        if (achievement) {
          newAchievements.push(achievement);
        }
      } catch (error) {
        // Achievement already exists, ignore
      }
    }

    // Check for goal achievement (R$ 6,000)
    if (parseFloat(stats.totalRevenue) >= 6000) {
      try {
        const achievement = await this.createAchievement({
          userId,
          type: 'goal_6k',
        });
        if (achievement) {
          newAchievements.push(achievement);
        }
      } catch (error) {
        // Achievement already exists, ignore
      }
    }

    return newAchievements;
  }
}

export const storage = new DatabaseStorage();
