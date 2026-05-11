# AgentFlow — AI Workflow Automation Platform

> Build powerful AI-powered automation workflows with drag-and-drop simplicity. No complex code required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-11-purple)](https://reactflow.dev/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-blueviolet)](https://clerk.com/)

---

## 📖 Full Documentation

For the complete college-style project report (7 chapters), see the **[`docs/`](./docs/)** folder:

| Chapter | Topic |
|---------|-------|
| [Chapter 1](./docs/01-introduction.md) | Introduction — Background, Purpose, Scope, Objectives |
| [Chapter 2](./docs/02-project-planning.md) | Project Planning — WBS, Gantt, PERT, Team, Requirements |
| [Chapter 3](./docs/03-system-analysis.md) | System Analysis — Problem, DFD, Use Case, DB Schema |
| [Chapter 4](./docs/04-system-design.md) | System Design — Architecture, ER Diagram, Class Diagram, Algorithms |
| [Chapter 5](./docs/05-implementation.md) | Implementation — Source Code Walkthrough, Module Integration |
| [Chapter 6](./docs/06-system-testing.md) | System Testing — Unit, Integration, System, Acceptance Tests |
| [Chapter 7](./docs/07-conclusion.md) | Conclusion — Results, Limitations, Future Work, Lessons Learned |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or later
- npm v9 or later
- A free [Neon.tech](https://neon.tech) account (PostgreSQL)
- A free [Clerk.com](https://clerk.com) account (Authentication)
- A free [Google AI Studio](https://aistudio.google.com/app/apikey) API key (Gemini AI)
- A Gmail account with an App Password (for email sending)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/minimal-n8n.git
cd minimal-n8n

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in your API keys (see below)

# 4. Push the database schema to your Neon database
npx prisma db push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the AgentFlow landing page.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with these variables:

```bash
# ── Google Gemini AI ──────────────────────────────
# Get your FREE API key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy..."
# Example: GEMINI_API_KEY="AIzaSyABC123xyzDEF456..."

# ── Email / SMTP Settings ─────────────────────────
# For Gmail: generate an App Password at https://myaccount.google.com/apppasswords
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"    # 16-char App Password
SMTP_FROM="your-email@gmail.com"

# ── Database (PostgreSQL via Neon) ────────────────
# Create a free database at: https://neon.tech
# Copy the connection string from your Neon dashboard
DATABASE_URL="postgresql://neondb_owner:password@ep-example.neon.tech/neondb?sslmode=verify-full"

# ── Clerk Authentication ──────────────────────────
# Create a free app at: https://clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

> ⚠️ **Never commit your `.env` file!** It is already listed in `.gitignore`.

---

## 🧩 Node Types

AgentFlow comes with **14 built-in node types** across 4 categories:

### 🔵 Trigger Nodes (start your workflow)
| Node | What it does |
|------|-------------|
| **Webhook Trigger** | Starts when the workflow is manually run; represents an incoming HTTP request |
| **Schedule Trigger** | Represents a recurring schedule (interval + unit) |
| **Telegram Trigger** | Fetches unread messages from a Telegram Bot |

### 🟣 AI Nodes (powered by Google Gemini)
| Node | What it does |
|------|-------------|
| **AI Text Generator** | Generates text from a prompt (emails, summaries, creative writing) |
| **AI Content Analyzer** | Analyzes text for sentiment, keywords, or summary |
| **AI Chatbot** | Generates conversational responses with a customizable personality |
| **AI Data Extractor** | Extracts structured JSON from unstructured text |

### 🟢 Action Nodes (do things)
| Node | What it does |
|------|-------------|
| **HTTP Request** | Calls any external REST API (GET, POST, PUT, DELETE) |
| **Data Transform** | Runs your own JavaScript code to reshape data |
| **Send Email** | Sends a real email via SMTP with optional attachments |
| **Excel Reader** | Reads an uploaded `.xlsx` or `.csv` file into a JSON array |
| **Excel Writer** | Generates a downloadable `.xlsx` file from a JSON array |

### 🔷 Logic Nodes (control flow)
| Node | What it does |
|------|-------------|
| **If/Else** | Branches the workflow based on a JavaScript condition |
| **Delay** | Pauses execution for a specified duration |
| **Loop** | Iterates over an array, running downstream nodes for each item |

---

## 🔗 Template Variables

The `{{input.fieldName}}` syntax lets you pass data between nodes **without writing code**.

### How it works

When a node executes, it produces `output` data. The next node receives this output as its `input`. You can reference any field from that input in your configuration using `{{input.fieldName}}`.

### Examples

| Scenario | Node Config Field | Template | What it resolves to |
|----------|-----------------|---------|-------------------|
| Send email to spreadsheet contact | **To** (Send Email) | `{{input.item.email}}` | `"alice@example.com"` |
| Personalize email subject | **Subject** | `Welcome, {{input.item.name}}!` | `"Welcome, Alice!"` |
| Use AI output in email body | **Body** | `{{input.generatedText}}` | The generated text from Gemini |
| Pass entire input to AI | **Prompt** | `Analyze this: {{input}}` | JSON-stringified input object |
| Use HTTP response field | **Body** | `New post: {{input.response.title}}` | `"New post: My Blog Title"` |
| Loop over spreadsheet rows | **Array to Iterate** | `{{input.items}}` | The actual array of row objects |

### Complete Example — Bulk Email from Excel

Build this workflow: `Excel Reader → Loop → AI Text Generator → Send Email`

1. **Excel Reader** — upload `contacts.xlsx` (columns: `name`, `email`)
2. **Loop** — configure:
   - Array to Iterate: `{{input.items}}`
3. **AI Text Generator** — configure:
   - Prompt: `Write a short, personalized welcome email for {{input.item.name}}. Keep it under 3 sentences.`
4. **Send Email** — configure:
   - To: `{{input.item.email}}`
   - Subject: `Welcome, {{input.item.name}}!`
   - Body: `{{input.generatedText}}`

Click **Run Workflow** → one personalized email is sent to each contact in your spreadsheet. ✅

---

## 🏗️ Project Structure

```
minimal-n8n-main/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (/)
│   ├── layout.tsx                # Root layout with Clerk provider
│   ├── globals.css               # Global styles
│   ├── dashboard/page.tsx        # Dashboard (/dashboard)
│   ├── editor/page.tsx           # Workflow editor (/editor)
│   └── api/
│       ├── ai/execute/route.ts   # POST — Google Gemini AI execution
│       ├── email/send/route.ts   # POST — Send email via SMTP
│       ├── http-proxy/route.ts   # POST — CORS-safe HTTP proxy
│       └── tasks/
│           ├── route.ts          # GET (list) / POST (create) workflows
│           └── [id]/route.ts     # GET / PUT / DELETE a specific workflow
├── components/
│   ├── CustomNode.tsx            # Node card on the canvas
│   ├── CustomEdge.tsx            # Animated edge arrow
│   ├── NodeConfigPanel.tsx       # Right-side configuration drawer
│   ├── Sidebar.tsx               # Left panel: node palette + run button
│   └── ui/                       # shadcn/ui components (Button, Input, etc.)
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── node-definitions.ts       # All 14 node types + config fields
│   ├── executor.ts               # Workflow execution engine
│   ├── store.ts                  # Zustand state management
│   ├── db.ts                     # Prisma client singleton
│   ├── syncUser.ts               # Clerk user → DB sync helper
│   └── utils.ts                  # Utility functions (cn, etc.)
├── prisma/
│   └── schema.prisma             # Database schema (User, AgentTask)
├── docs/                         # 📚 Full project documentation
│   ├── README.md                 # Documentation index
│   ├── 01-introduction.md
│   ├── 02-project-planning.md
│   ├── 03-system-analysis.md
│   ├── 04-system-design.md
│   ├── 05-implementation.md
│   ├── 06-system-testing.md
│   └── 07-conclusion.md
├── middleware.ts                 # Clerk auth middleware
├── next.config.ts                # Next.js configuration
├── prisma.config.ts              # Prisma configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | 16 | Full-stack framework (frontend + API routes) |
| [React](https://react.dev) | 19 | UI rendering |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling |
| [React Flow](https://reactflow.dev) | 11 | Visual workflow canvas |
| [Zustand](https://github.com/pmndrs/zustand) | 5 | Global state management |
| [Clerk](https://clerk.com) | 7 | Authentication |
| [Prisma](https://prisma.io) | 7 | Database ORM |
| [Neon](https://neon.tech) | — | Serverless PostgreSQL |
| [Google Gemini](https://ai.google.dev) | 0.24 | AI text generation |
| [Nodemailer](https://nodemailer.com) | 8 | Email sending |
| [SheetJS (xlsx)](https://sheetjs.com) | 0.18 | Excel file processing |
| [Lucide React](https://lucide.dev) | 0.552 | Icons |
| [shadcn/ui](https://ui.shadcn.com) | — | Base UI components |

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npx prisma db push       # Push schema changes to the database
npx prisma studio        # Open Prisma Studio (visual DB browser)
```

---

## 🤝 How to Add a New Node Type

It only takes 3 steps. See [Appendix C in the docs](./docs/07-conclusion.md#appendix-c--how-to-add-a-new-node-type) for a full walkthrough.

---

## 📄 License

This project is open source and available for educational use.

---

*Built with ❤️ using Next.js, React Flow, Google Gemini, and lots of ☕*
# mini-n8n
