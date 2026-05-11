# Appendices

---

The following appendices provide supplementary material that supports the main report for **AgentFlow: A Visual AI Workflow Automation Platform**. This material is referenced from the main chapters and is included here to avoid interrupting the narrative flow of the report.

---

## Appendix A — Environment Configuration Reference

This appendix provides a complete reference for all environment variables required to run the AgentFlow application locally or in a production environment.

**File:** `.env` (project root — **never commit to version control**)

| Variable | Description | Required | Example Value |
|----------|-------------|----------|---------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI node execution | ✅ Yes | `AIza...` |
| `DATABASE_URL` | PostgreSQL connection string (Neon or local) | ✅ Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) | ✅ Yes | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (backend) | ✅ Yes | `sk_test_...` |
| `SMTP_HOST` | SMTP server hostname | ✅ Yes | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | ✅ Yes | `465` |
| `SMTP_USER` | SMTP username (email address) | ✅ Yes | `you@gmail.com` |
| `SMTP_PASS` | SMTP password or app password | ✅ Yes | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Sender display address | ✅ Yes | `you@gmail.com` |

**Sample `.env` template:**
```bash
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL (Neon)
DATABASE_URL=postgresql://username:password@hostname/dbname?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# SMTP Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

---

## Appendix B — Database Schema (Prisma)

This appendix reproduces the complete Prisma schema file used to define the database models.

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String      @id @default(cuid())
  clerkId   String      @unique
  email     String      @unique
  name      String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  tasks     AgentTask[]
}

model AgentTask {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  nodes       Json
  edges       Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Notes:**
- `User.clerkId` links the application user record to the Clerk authentication provider.
- `AgentTask.nodes` and `AgentTask.edges` are stored as JSON columns, allowing flexible workflow graph serialisation without a fixed schema.
- Cascading delete ensures all workflows belonging to a user are removed if the user account is deleted.

---

## Appendix C — Node Type Catalogue

This appendix lists all 14 node types supported by AgentFlow v1.0, along with their category and primary configuration fields.

**File:** `lib/node-definitions.ts`

| # | Node Type | Category | Key Config Fields |
|---|-----------|----------|-------------------|
| 1 | `trigger-manual` | Trigger | Label |
| 2 | `trigger-telegram` | Trigger | Bot Token, Chat ID, Limit |
| 3 | `ai-text-gen` | AI | Prompt, System Instruction |
| 4 | `ai-analysis` | AI | Analysis Type, Input Text |
| 5 | `ai-chatbot` | AI | System Prompt, User Message |
| 6 | `ai-data-extract` | AI | Schema Description, Input Text |
| 7 | `action-email` | Action | To, Subject, Body, Attachment |
| 8 | `action-http` | Action | Method, URL, Headers, Body |
| 9 | `action-excel-reader` | Action | File Upload, Sheet Name |
| 10 | `action-excel-writer` | Action | Data, Output Filename |
| 11 | `action-transform` | Action | JavaScript Code |
| 12 | `logic-if-else` | Logic | Condition Expression |
| 13 | `logic-loop` | Logic | Items Array Path |
| 14 | `logic-delay` | Logic | Delay Duration (ms) |

---

## Appendix D — API Endpoint Reference

This appendix documents all backend API endpoints exposed by the AgentFlow Next.js application.

| Method | Endpoint | Auth Required | Description |
|--------|---------|---------------|-------------|
| `GET` | `/api/tasks` | ✅ Yes | Retrieve all saved workflows for the authenticated user |
| `POST` | `/api/tasks` | ✅ Yes | Save a new workflow |
| `GET` | `/api/tasks/[id]` | ✅ Yes | Retrieve a single workflow by ID |
| `PUT` | `/api/tasks/[id]` | ✅ Yes | Update an existing workflow |
| `DELETE` | `/api/tasks/[id]` | ✅ Yes | Delete a workflow |
| `POST` | `/api/ai/execute` | ❌ No | Execute an AI node via Google Gemini |
| `POST` | `/api/email/send` | ❌ No | Send an email via Nodemailer SMTP |
| `POST` | `/api/http-proxy` | ❌ No | Proxy an HTTP request to an external API |

---

## Appendix E — Glossary of Terms

| Term | Definition |
|------|-----------|
| **Workflow** | A directed graph of connected nodes that defines an automated process. |
| **Node** | A discrete processing unit in a workflow graph (e.g., an AI node, email node). |
| **Edge** | A directed connection between two nodes, representing data flow. |
| **Trigger Node** | The entry point of a workflow that initiates execution. |
| **Template Variable** | A placeholder in the format `{{nodeId.key}}` that is resolved at runtime. |
| **LLM** | Large Language Model — an AI model trained on large text corpora. |
| **Gemini** | Google's family of multimodal large language models. |
| **Prisma** | A type-safe ORM for Node.js/TypeScript. |
| **Clerk** | A managed authentication and user management service. |
| **Neon** | A serverless PostgreSQL database service. |
| **SMTP** | Simple Mail Transfer Protocol — used for sending email. |
| **CRUD** | Create, Read, Update, Delete — the four basic database operations. |
| **API** | Application Programming Interface — a contract for inter-system communication. |
| **REST** | Representational State Transfer — an architectural style for web APIs. |
| **JSON** | JavaScript Object Notation — a lightweight data interchange format. |
| **ORM** | Object-Relational Mapper — abstracts database access through code objects. |
| **SSR** | Server-Side Rendering — rendering HTML on the server before sending to browser. |
| **DFD** | Data Flow Diagram — a diagram modelling the flow of data through a system. |
| **ER Diagram** | Entity-Relationship Diagram — a visual representation of database structure. |
| **WBS** | Work Breakdown Structure — a hierarchical decomposition of project tasks. |
| **PERT** | Program Evaluation and Review Technique — a project scheduling method. |
| **CPM** | Critical Path Method — identifies the longest task sequence in a project. |

---

## Appendix F — Installation and Setup Guide

A complete step-by-step guide for setting up AgentFlow in a local development environment.

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x (or pnpm >= 8.x)
- PostgreSQL database (Neon free tier recommended)
- Clerk account (free tier available)
- Google AI Studio account (for Gemini API key)
- Gmail account with App Password (for SMTP)

### Step-by-Step Setup

```bash
# Step 1: Clone the repository
git clone https://github.com/[your-username]/minimal-n8n.git
cd minimal-n8n-main

# Step 2: Install all dependencies
npm install
# or
pnpm install

# Step 3: Create environment configuration
cp .env.example .env
# Edit .env and fill in all required values (see Appendix A)

# Step 4: Push the Prisma schema to your database
npx prisma db push

# Step 5: (Optional) Verify Prisma client is generated
npx prisma generate

# Step 6: Start the development server
npm run dev
# or
pnpm dev
```

### Accessing the Application

Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

- The **landing page** is publicly accessible.
- Click **Sign In** or **Get Started** to create an account via Clerk.
- After authentication, you will be redirected to the **Dashboard**.
- Click **New Workflow** or **Open Editor** to start building automations.

---

## Appendix G — Software Licenses

AgentFlow is built upon open-source libraries. The following table lists the key dependencies and their respective licenses.

| Library | Version | License |
|---------|---------|---------|
| Next.js | 16.x | MIT |
| React | 19.x | MIT |
| React Flow | 11.x | MIT |
| Zustand | 5.x | MIT |
| Prisma | 7.x | Apache 2.0 |
| Clerk (SDK) | Latest | MIT |
| Nodemailer | Latest | MIT |
| SheetJS (Community) | Latest | Apache 2.0 |
| Tailwind CSS | 4.x | MIT |
| shadcn/ui | Latest | MIT |
| TypeScript | 5.x | Apache 2.0 |
| `@google/generative-ai` | Latest | Apache 2.0 |

> The AgentFlow application source code is released under the **MIT License**. See the `LICENSE` file in the project root for full terms.

---

*← Back to [References](./references.md) | Back to [docs/README.md](./README.md)*
