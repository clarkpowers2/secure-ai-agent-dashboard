# Secure AI Agent Dashboard

## Overview

A secure monitoring dashboard for an AI agent system that provides real-time visibility into system health, activity logs, pattern insights, and privacy controls. The application features PIN-based authentication, encrypted data handling, and comprehensive monitoring of AI agent modules including troubleshooting, file continuity, emotion detection, pattern learning, and auto-organization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Design System**: Material Design 3 principles adapted for dashboard use
- **Charts**: Recharts for data visualization (bar charts, line graphs)
- **Typography**: Inter (primary), JetBrains Mono (monospace for logs/code)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend bundling, esbuild for server bundling
- **API Style**: RESTful JSON APIs under `/api/*` prefix
- **Development**: Hot module replacement via Vite middleware

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Definition**: Zod schemas for validation, shared between client and server
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Current Implementation**: In-memory storage adapter (IStorage interface) designed for easy PostgreSQL migration

### Authentication & Security
- **Method**: PIN-based authentication with Argon2 password hashing
- **Encryption**: Fernet symmetric encryption for sensitive data (patterns file)
- **Session**: Express sessions with secure cookie handling
- **PIN Management**: Change PIN functionality with current PIN verification

### Key Design Patterns
- **Shared Types**: `/shared/schema.ts` contains all type definitions used by both frontend and backend
- **Component Architecture**: Atomic design with reusable UI components in `/client/src/components/ui/`
- **Custom Components**: Domain-specific components for dashboard (SystemGauge, StatusIndicator, ModuleCard, PrivacyToggle)
- **Storage Interface**: IStorage interface allows swapping between in-memory and database implementations

### Page Structure
- **Dashboard**: System health gauges, diagnostics panel, alerts summary, command prompt, module status cards, quick setup guide, recent activity
- **Appointments**: Schedule and track tasks with priority levels
- **Activity**: Filterable activity logs with search, export to CSV
- **Patterns**: App usage charts, file access frequency, emotion history timeline
- **Alerts**: Configurable alert rules with thresholds for CPU, memory, disk
- **Quick Actions**: Pre-defined playbooks for common tasks (pause/resume agent, run diagnostics, clear cache, rotate keys, restart modules)
- **Audit**: Complete audit trail of all security events and system changes
- **Backup**: Export settings, logs, patterns, and appointments data
- **Privacy**: Toggle switches for camera, file access, auto-organize, pattern learning, emotion detection
- **Security**: PIN management, encryption key rotation
- **Settings**: Agent configuration (intervals, thresholds, folders)
- **Setup Guide**: Device-specific connection instructions for Desktop, Laptop, Mobile

### Enterprise Features
- **Notifications Bell**: Real-time alert notifications in the header with unread count badge
- **Agent Status Indicator**: Shows Python agent connection status (Online/Offline) in header
- **System Diagnostics Panel**: Real-time health monitoring with color-coded status indicators
- **Smart Alerts**: Configurable threshold-based alerts with in-app notifications
- **Audit Trail**: Complete history of security events, privacy changes, and system actions
- **Quick Actions/Playbooks**: One-click execution of common administrative tasks
- **Command Prompt**: Send typed commands directly to the Python agent with queue support
- **PWA Support**: Installable progressive web app with offline capability
- **Keyboard Shortcuts**: Alt+H (Dashboard), Alt+A (Appointments), Alt+L (Activity), etc.

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations in `/migrations` directory

### UI Libraries
- **Radix UI**: Full suite of accessible primitives (dialog, dropdown, accordion, etc.)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **Vaul**: Drawer component
- **CMDK**: Command palette component

### Data & Forms
- **Zod**: Schema validation
- **React Hook Form**: Form handling with `@hookform/resolvers`
- **date-fns**: Date formatting

### Build & Development
- **Vite**: Frontend bundler with React plugin
- **tsx**: TypeScript execution for development
- **Replit plugins**: Runtime error overlay, cartographer, dev banner

### Python Agent Bridge
The dashboard connects to the Python AI agent via `agent_bridge.py`:
- **Heartbeat System**: Agent sends status every 5 seconds
- **Command Queue**: Dashboard queues commands, agent picks them up
- **Auto-disconnect**: Shows offline after 15 seconds without heartbeat
- **State Sync**: Modules, patterns, and system metrics sync in real-time

### Python Agent Dependencies (Reference)
The dashboard monitors a Python-based AI agent that uses:
- **ollama**: Local LLM integration (phi3, llava:7b models)
- **deepface**: Emotion detection
- **cv2**: Webcam access
- **psutil**: System monitoring
- **watchdog**: File system monitoring
- **cryptography**: Fernet encryption
- **argon2**: PIN hashing
- **requests**: Dashboard API communication (via agent_bridge.py)

### Key Files
- `SETUP_GUIDE.md`: Complete instructions for running the system
- `agent_bridge.py`: Python module to connect agent to dashboard
- `server/agent-bridge.ts`: Server-side bridge handling heartbeats and commands