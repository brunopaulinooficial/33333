# Sentinela Drivers - Desafio 6K

## Overview

A full-stack web application for a driver challenge program where participants compete to reach a monthly revenue goal of R$6,000. The app features user authentication via Replit Auth, daily entry tracking, monthly statistics, achievements, and competitive ranking. Built with a modern React frontend and Express.js backend, using PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens and mobile-first responsive design
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect and session management
- **API Design**: RESTful API endpoints with input validation using Zod
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **User Management**: Automatic user creation and profile management
- **Onboarding Flow**: Required profile setup for new users

### Data Models
- **Users**: Profile information, onboarding status, display names
- **Daily Entries**: Date-specific records of rides, revenue, and fuel costs
- **Monthly Stats**: Aggregated monthly performance metrics and goal tracking
- **Achievements**: User accomplishments and milestones
- **Sessions**: Secure session storage (required for Replit Auth)

### Business Logic
- **Daily Tracking**: Users log rides, revenue, and fuel costs daily
- **Monthly Goals**: R$6,000 monthly revenue target with progress tracking
- **Ranking System**: Monthly leaderboard based on performance metrics
- **Achievement System**: Milestone rewards and recognition

### UI/UX Design
- **Mobile-First**: Optimized for mobile devices with touch-friendly interfaces
- **Progressive Web App**: Full-screen mobile experience
- **Custom Theme**: Brand-specific color scheme and styling
- **Component Library**: Reusable UI components with consistent design patterns

## Data Flow

### User Journey
1. **Landing** → User sees marketing page with login option
2. **Authentication** → Replit Auth handles login/registration
3. **Onboarding** → New users complete profile setup
4. **Dashboard** → Main interface showing progress, stats, and achievements
5. **Daily Entry** → Users log daily performance data
6. **Ranking** → Competitive leaderboard view

### Data Processing
1. **Entry Creation** → Daily entries automatically update monthly statistics
2. **Achievement Tracking** → System monitors milestones and awards achievements
3. **Ranking Calculation** → Monthly performance metrics determine leaderboard position
4. **Progress Tracking** → Real-time goal progress updates

## External Dependencies

### Core Technologies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: TanStack Query for server state
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Express.js**: Web framework and middleware
- **Authentication**: Passport.js with OpenID Client
- **Database**: Drizzle ORM with Neon PostgreSQL driver
- **Session Management**: express-session with connect-pg-simple
- **Utilities**: Memoizee for caching, nanoid for ID generation

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Database Tools**: Drizzle Kit for schema management
- **Development**: tsx for TypeScript execution, hot reload support

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL development instance
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served from dist/public directory
- **Database**: Production Neon PostgreSQL instance

### Environment Configuration
- **Session Security**: Secure HTTP-only cookies in production
- **Database Connection**: SSL-enabled PostgreSQL connection
- **Authentication**: Replit Auth production configuration
- **Asset Optimization**: Minified CSS/JS with tree shaking

### Scalability Considerations
- **Database**: Connection pooling with Neon serverless
- **Caching**: Memoized OIDC configuration and query results
- **Performance**: Optimized queries and efficient data structures
- **Monitoring**: Request logging and error tracking