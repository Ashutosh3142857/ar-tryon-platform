# Overview

This is an AR (Augmented Reality) Try-On application that allows users to virtually try on different products using their device's camera. The app provides an interactive experience where users can select from various product categories (jewelry, shoes, clothes, furniture) and see how they look with AR overlays positioned on their face or body using real-time face detection.

The application is built as a full-stack web application with a React frontend and Express backend, designed to provide a seamless AR shopping experience with real-time camera feeds, face landmark detection, and product visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript, using Vite as the build tool. The architecture follows a component-based design with custom hooks for camera management and face detection.

**Key Design Decisions:**
- **React with TypeScript**: Provides type safety and better developer experience
- **Shadcn/ui Components**: Uses Radix UI primitives with Tailwind CSS for consistent, accessible UI components
- **Wouter for Routing**: Lightweight routing solution instead of React Router
- **TanStack Query**: Handles server state management and API interactions
- **Custom Hooks Pattern**: Encapsulates complex logic for camera operations and face detection

**Component Structure:**
- Modular AR components (camera feed, product overlay, positioning controls)
- UI components using the shadcn/ui design system
- Custom hooks for camera management (`use-camera`) and face detection (`use-face-detection`)

## Backend Architecture  
The server uses Express.js with TypeScript, following a simple REST API pattern.

**Key Design Decisions:**
- **Express.js**: Lightweight and flexible web framework
- **In-Memory Storage**: Uses a MemStorage class for user data (easily replaceable with database)
- **Middleware Pattern**: Custom logging middleware for API requests
- **Development/Production Split**: Vite integration for development, static serving for production

**API Structure:**
- RESTful endpoints for product management (`/api/products`)
- Category-based product filtering
- Modular route registration system

## Data Storage Solutions
Currently implements in-memory storage with a clear interface for future database integration.

**Storage Design:**
- **Interface-Based**: `IStorage` interface allows easy swapping of storage implementations
- **Drizzle ORM Ready**: Database schema defined using Drizzle with PostgreSQL support
- **Schema Design**: Supports users, products, and AR try-on sessions with proper relationships

**Database Schema:**
- Users table with authentication fields
- Products table with category, images, and AR overlay data
- Try-on sessions for storing user interactions and captured images

## Authentication and Authorization
Basic user schema is defined but authentication is not yet implemented in the current codebase.

**Planned Features:**
- User registration and login
- Session management with try-on data persistence
- User-specific product recommendations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tool
- **face-api.js**: Face detection and landmark recognition
- **@tanstack/react-query**: Server state management

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools  
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production backend
- **PostCSS & Autoprefixer**: CSS processing

### AR and Camera Features
- **MediaDevices API**: Native browser camera access
- **Face-api.js Models**: Pre-trained models for face detection loaded from CDN
- **Canvas API**: For image processing and AR overlay rendering

The application is designed to be deployed on platforms like Replit with automatic database provisioning through environment variables. The modular architecture allows for easy scaling and feature additions, particularly around the AR functionality and product management system.