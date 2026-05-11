# AgentFlow — Complete Project Documentation

> A visual AI workflow automation platform built with Next.js, Google Gemini, and React Flow.

---

## 📚 Documentation Index

This documentation is organized into multiple files for clarity. Navigate to the chapter that best matches your interest:

### Front Matter

| # | File | Description |
|---|------|-------------|
| 01 | [01-title-page.md](./01-title-page.md) | Title page with institution and student details |
| 02 | [02-declaration.md](./02-declaration.md) | Student declaration of originality |
| 03 | [03-certificate-guide.md](./03-certificate-guide.md) | Certificate from project guide |
| 04 | [04-certificate-company.md](./04-certificate-company.md) | Certificate from company (if applicable) |
| 05 | [05-approval-certificate.md](./05-approval-certificate.md) | Examiner approval certificate |
| 06 | [06-acknowledgement.md](./06-acknowledgement.md) | Acknowledgements |
| 07 | [07-table-of-contents.md](./07-table-of-contents.md) | Full table of contents |
| 08 | [08-list-of-figures.md](./08-list-of-figures.md) | List of all figures |
| 09 | [09-list-of-tables.md](./09-list-of-tables.md) | List of all tables |
| 10 | [10-list-of-algorithms.md](./10-list-of-algorithms.md) | List of all algorithms |
| 11 | [11-abstract.md](./11-abstract.md) | Project abstract |

### Chapters

| Chapter | File | Description |
|---------|------|-------------|
| 1. Introduction | [chapter-1-introduction.md](./chapter-1-introduction.md) | Background, purpose, scope, and objectives |
| 2. Project Planning | [chapter-2-planning-scheduling.md](./chapter-2-planning-scheduling.md) | Plan, WBS, Gantt, PERT, team, methodology, requirements |
| 3. System Analysis | [chapter-3-system-analysis.md](./chapter-3-system-analysis.md) | Problem definition, requirements, DFD, use case, DB schema |
| 4. System Design | [chapter-4-system-design.md](./chapter-4-system-design.md) | Architecture, ER diagram, class diagram, I/O design |
| 5. Implementation | [chapter-5-implementation.md](./chapter-5-implementation.md) | Source code walkthrough, module integration, screenshots |
| 6. System Testing | [chapter-6-system-testing.md](./chapter-6-system-testing.md) | Unit, integration, system, acceptance testing |
| 7. Conclusion | [chapter-7-conclusion.md](./chapter-7-conclusion.md) | Results, limitations, future work, lessons learned |
| — | [references.md](./references.md) | IEEE-formatted references |
| — | [appendices.md](./appendices.md) | Appendices A–G |

---

## 🚀 Quick Start (For New Developers)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/minimal-n8n.git
cd minimal-n8n

# 2. Install dependencies
npm install

# 3. Setup environment variables (copy the example)
cp .env.example .env
# Now fill in your own API keys (see Chapter 2 for details)

# 4. Push the database schema
npx prisma db push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Quick Reference

| Variable | What It Does | Where to Get It |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | Powers all AI nodes | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `DATABASE_URL` | PostgreSQL connection string | [Neon.tech](https://neon.tech) or any Postgres provider |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (public) | [Clerk Dashboard](https://clerk.com) |
| `CLERK_SECRET_KEY` | Clerk auth (secret) | [Clerk Dashboard](https://clerk.com) |
| `SMTP_HOST` | Email server host | Your email provider |
| `SMTP_PORT` | Email server port | Usually `465` or `587` |
| `SMTP_USER` | Email username | Your email address |
| `SMTP_PASS` | Email app password | Your email provider |
| `SMTP_FROM` | Sender email address | Same as `SMTP_USER` |

---

## 🛠️ Tech Stack At a Glance

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19 + Tailwind CSS 4 |
| Workflow Canvas | React Flow 11 |
| State Management | Zustand 5 |
| AI Backend | Google Gemini (`gemini-2.5-flash-lite`) |
| Database ORM | Prisma 7 |
| Database | PostgreSQL (Neon serverless) |
| Authentication | Clerk |
| Email | Nodemailer |
| Excel Processing | SheetJS (xlsx) |
| Language | TypeScript 5 |

---

## 📁 Folder Structure

```
minimal-n8n-main/
├── app/                          # Next.js App Router pages + API
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (Clerk provider)
│   ├── globals.css               # Global styles
│   ├── dashboard/
│   │   └── page.tsx              # User dashboard (saved workflows)
│   ├── editor/
│   │   └── page.tsx              # Main workflow editor canvas
│   └── api/
│       ├── ai/execute/route.ts   # Google Gemini AI endpoint
│       ├── email/send/route.ts   # Nodemailer email endpoint
│       ├── http-proxy/route.ts   # CORS-safe HTTP proxy
│       └── tasks/                # CRUD for saved workflows
│           ├── route.ts          # GET all / POST new
│           └── [id]/route.ts     # GET one / PUT / DELETE
├── components/
│   ├── CustomNode.tsx            # Visual node card on the canvas
│   ├── CustomEdge.tsx            # Animated connecting arrows
│   ├── NodeConfigPanel.tsx       # Right-side config drawer
│   ├── Sidebar.tsx               # Left panel: node palette + run button
│   └── ui/                       # shadcn/ui base components
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── node-definitions.ts       # All node types + their config fields
│   ├── executor.ts               # Workflow execution engine
│   ├── store.ts                  # Zustand global state
│   ├── db.ts                     # Prisma client singleton
│   ├── syncUser.ts               # Syncs Clerk user → DB
│   └── utils.ts                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema (User + AgentTask)
├── public/                       # Static assets
├── .env                          # Environment variables (never commit!)
├── middleware.ts                 # Clerk auth middleware
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

*For full details on any topic, open the corresponding chapter file in this `docs/` folder.*
