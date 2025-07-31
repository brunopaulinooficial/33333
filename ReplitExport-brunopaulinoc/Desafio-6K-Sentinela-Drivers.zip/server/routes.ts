import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerUser, authenticateUser } from "./auth";
import { insertDailyEntrySchema } from "@shared/schema";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  profileImageUrl: z.string().url().optional(),
});

const dailyEntryRequestSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  rides: z.number().min(0, "Rides must be non-negative"),
  revenue: z.string().min(1, "Revenue is required"),
  fuelCost: z.string().min(1, "Fuel cost is required"),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  displayName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await registerUser(
        validatedData.email,
        validatedData.password,
        validatedData.displayName
      );
      
      // Log the user in immediately after registration
      req.session.userId = user.id;
      
      res.json({ message: "Usuário criado com sucesso", user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error: any) {
      console.error("Error registering user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(400).json({ message: error.message || "Erro ao criar usuário" });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await authenticateUser(validatedData.email, validatedData.password);
      
      // Create session
      req.session.userId = user.id;
      
      res.json({ message: "Login realizado com sucesso", user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error: any) {
      console.error("Error logging in user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(401).json({ message: error.message || "Erro no login" });
      }
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      
      const user = await storage.updateUserProfile(
        userId,
        validatedData.displayName,
        validatedData.profileImageUrl
      );
      
      await storage.markUserOnboarded(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Daily entry routes
  app.post('/api/daily-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = dailyEntryRequestSchema.parse({
        ...req.body,
        userId,
        revenue: typeof req.body.revenue === 'number' ? req.body.revenue.toString() : req.body.revenue,
        fuelCost: typeof req.body.fuelCost === 'number' ? req.body.fuelCost.toString() : req.body.fuelCost,
      });

      // Check if entry already exists for this date
      const existingEntry = await storage.getDailyEntry(userId, validatedData.date);
      
      let entry;
      if (existingEntry) {
        entry = await storage.updateDailyEntry(existingEntry.id, {
          rides: validatedData.rides,
          revenue: validatedData.revenue,
          fuelCost: validatedData.fuelCost,
        });
      } else {
        entry = await storage.createDailyEntry({
          userId: validatedData.userId,
          date: validatedData.date,
          rides: validatedData.rides,
          revenue: validatedData.revenue,
          fuelCost: validatedData.fuelCost,
        });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error creating/updating daily entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save daily entry" });
      }
    }
  });

  app.get('/api/daily-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const entries = await storage.getUserDailyEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching daily entries:", error);
      res.status(500).json({ message: "Failed to fetch daily entries" });
    }
  });

  app.get('/api/daily-entries/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { date } = req.params;
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const entry = await storage.getDailyEntry(userId, date);
      res.json(entry || null);
    } catch (error) {
      console.error("Error fetching daily entry:", error);
      res.status(500).json({ message: "Failed to fetch daily entry" });
    }
  });

  // Monthly stats routes
  app.get('/api/monthly-stats/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { month } = req.params;
      
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: "Invalid month format (YYYY-MM)" });
      }

      const stats = await storage.getOrCreateMonthlyStats(userId, month);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      res.status(500).json({ message: "Failed to fetch monthly stats" });
    }
  });

  // Ranking routes
  app.get('/api/ranking/:month', isAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.params;
      
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: "Invalid month format (YYYY-MM)" });
      }

      const ranking = await storage.getMonthlyRanking(month);
      res.json(ranking);
    } catch (error) {
      console.error("Error fetching ranking:", error);
      res.status(500).json({ message: "Failed to fetch ranking" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
