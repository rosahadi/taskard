# Taskard 📋

A modern, full-stack project management application built with Next.js and Express.js. Taskard helps teams organize projects, manage tasks, and collaborate effectively with a clean, intuitive interface.

## ✨ Features

- **Multi-Workspace Support** - Create and manage multiple workspaces
- **Project Organization** - Structure your work with projects and tasks
- **Task Management** - Create, assign, and track tasks with priorities and statuses
- **Team Collaboration** - Invite team members and manage workspace roles
- **Drag & Drop Interface** - Intuitive task management with React DnD
- **File Attachments** - Attach files to tasks and projects
- **Comments System** - Discuss tasks with team members

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Redux Toolkit** - State management with RTK Query
- **React Hook Form** - Form handling with validation
- **Framer Motion** - Smooth animations
- **React DnD** - Drag and drop functionality

### Backend

- **Express.js** - Node.js web framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication and authorization
- **Passport.js** - Authentication middleware
- **Cloudinary** - File upload and management
- **Zod** - Runtime type validation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rosahadi/taskard.git
   cd taskard
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create `.env` files in both `server` and `client` directories:

4. **Database Setup**

   ```bash
   cd server

   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the Development Servers**

   ```bash
   # Terminal 1 - Start the backend server
   cd server
   npm run dev

   # Terminal 2 - Start the frontend server
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### Getting Started

1. **Sign Up** - Create your account or use Google OAuth
2. **Create Workspace** - Set up your first workspace
3. **Invite Team Members** - Add collaborators to your workspace
4. **Create Projects** - Organize your work into projects
5. **Manage Tasks** - Create, assign, and track task progress

### Key Workflows

- **Task Creation**: Click "+" to create tasks with descriptions, due dates, and priorities
- **Assignment**: Drag and drop to assign tasks or use the assignment dropdown
- **Status Updates**: Move tasks through TODO → IN_PROGRESS → REVIEW → DONE
- **Collaboration**: Add comments and attachments to tasks
- **Project Planning**: Use the calendar view to visualize project timelines

## 🔧 Scripts

### Server Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
```

### Client Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```
