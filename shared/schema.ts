import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants table for multi-tenancy
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Company/Brand name
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  email: text("email").notNull().unique(),
  phone: text("phone"),
  website: text("website"),
  logo: text("logo"), // Logo image URL
  primaryColor: text("primary_color").default("#8B5CF6"), // Brand color
  isActive: boolean("is_active").default(true),
  subscriptionPlan: text("subscription_plan").default("free"), // free, basic, premium
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users for each tenant
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("admin"), // admin, manager, editor
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// End users (consumers using AR try-on)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Products belonging to tenants
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'jewelry', 'shoes', 'clothes', 'furniture'
  sku: text("sku"), // Stock keeping unit
  imageUrl: text("image_url").notNull(),
  overlayImageUrl: text("overlay_image_url"), // AR overlay image
  price: integer("price"), // in cents
  originalPrice: integer("original_price"), // in cents
  description: text("description"),
  sizes: jsonb("sizes"), // Array of available sizes
  colors: jsonb("colors"), // Array of available colors
  materials: text("materials"),
  tags: jsonb("tags"), // Array of tags for filtering
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  stockQuantity: integer("stock_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Try-on sessions with tenant context
export const tryOnSessions = pgTable("try_on_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id"),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  capturedImageUrl: text("captured_image_url"),
  sessionData: text("session_data"), // JSON data for AR session state
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product analytics
export const productAnalytics = pgTable("product_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  views: integer("views").default(0),
  tryOns: integer("try_ons").default(0),
  captures: integer("captures").default(0),
  date: timestamp("date").defaultNow(),
});

// Zod schemas for validation
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

// Schema for admin user registration (without tenantId)
export const registerAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  tenantId: true, // Exclude tenantId since it's added during registration
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTryOnSessionSchema = createInsertSchema(tryOnSessions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type TryOnSession = typeof tryOnSessions.$inferSelect;
export type InsertTryOnSession = z.infer<typeof insertTryOnSessionSchema>;
export type ProductAnalytics = typeof productAnalytics.$inferSelect;
