import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";
import { insertTenantSchema, insertAdminUserSchema, registerAdminUserSchema, insertProductSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate admin users
async function authenticateAdmin(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const adminUser = await storage.getAdminUser(decoded.userId);
    
    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    req.adminUser = adminUser;
    req.tenantId = adminUser.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Public file serving endpoint
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin authentication
  app.post("/api/admin/register", async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body.tenant);
      const adminData = registerAdminUserSchema.parse(req.body.admin);

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create tenant first
      const tenant = await storage.createTenant(tenantData);

      // Create admin user with tenant ID
      const adminUserData = {
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role || 'admin',
        isActive: adminData.isActive ?? true,
        tenantId: tenant.id,
      };
      
      const adminUser = await storage.createAdminUser(adminUserData);

      // Generate JWT token
      const token = jwt.sign({ userId: adminUser.id }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        token,
        user: { ...adminUser, password: undefined },
        tenant,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating tenant and admin:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, tenantSlug } = req.body;

      // Get tenant by slug
      const tenant = await storage.getTenantBySlug(tenantSlug);
      if (!tenant) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get admin user
      const adminUser = await storage.getAdminUserByEmail(email, tenant.id);
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, adminUser.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await storage.updateAdminUser(adminUser.id, {});

      // Generate JWT token
      const token = jwt.sign({ userId: adminUser.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        token,
        user: { ...adminUser, password: undefined },
        tenant,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get tenant products (for AR interface)
  app.get("/api/:tenantSlug/products", async (req, res) => {
    try {
      const { tenantSlug } = req.params;
      const tenant = await storage.getTenantBySlug(tenantSlug);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const products = await storage.getProductsByTenant(tenant.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching tenant products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get products by category for a tenant
  app.get("/api/:tenantSlug/products/category/:category", async (req, res) => {
    try {
      const { tenantSlug, category } = req.params;
      
      if (!['jewelry', 'shoes', 'clothes', 'furniture'].includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const tenant = await storage.getTenantBySlug(tenantSlug);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const products = await storage.getProductsByCategory(tenant.id, category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Admin-only routes (protected)
  app.get("/api/admin/products", authenticateAdmin, async (req: any, res) => {
    try {
      const products = await storage.getProductsByTenant(req.tenantId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", authenticateAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        tenantId: req.tenantId,
      });
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // File upload endpoint for products
  app.post("/api/admin/upload", authenticateAdmin, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Save try-on session
  app.post("/api/:tenantSlug/try-on-sessions", async (req, res) => {
    try {
      const { tenantSlug } = req.params;
      const tenant = await storage.getTenantBySlug(tenantSlug);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const sessionSchema = z.object({
        userId: z.string().optional(),
        productId: z.string(),
        capturedImageUrl: z.string().optional(),
        sessionData: z.string().optional(),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional()
      });

      const validatedData = sessionSchema.parse(req.body);
      const session = await storage.createTryOnSession({
        ...validatedData,
        tenantId: tenant.id,
      });
      
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      
      console.error("Error creating try-on session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get try-on sessions (optional - for history)
  app.get("/api/admin/try-on-sessions", authenticateAdmin, async (req: any, res) => {
    try {
      const { userId } = req.query;
      const sessions = await storage.getTryOnSessions(userId as string);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching try-on sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        camera: "available",
        faceDetection: "ready",
        products: "loaded",
        multiTenant: "enabled"
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
