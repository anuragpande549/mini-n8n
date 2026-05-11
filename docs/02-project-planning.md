# Chapter 2 — Project Planning and Scheduling

---

## 2.1 Project Plan

The AgentFlow project was planned as a **4-week sprint** from initial concept to a deployable version 1.0. The plan was divided into four phases:

| Phase | Week | Goal |
|-------|------|------|
| Phase 1: Foundation | Week 1 | Set up project structure, authentication (Clerk), database (Prisma + Neon), and the basic React Flow canvas. |
| Phase 2: Core Nodes | Week 2 | Implement all 14 node types, the workflow executor, and template variable resolution. |
| Phase 3: Integrations | Week 3 | Connect Google Gemini for AI nodes, Nodemailer for email, SheetJS for Excel, Telegram for messaging triggers. |
| Phase 4: Polish & Test | Week 4 | Dashboard UI, workflow persistence, bug fixing, testing, and documentation. |

---

## 2.2 Work Breakdown Structure (WBS)

**Table 2.1 — Work Breakdown Structure**

| ID | Task | Sub-tasks |
|----|------|-----------|
| 1 | Project Setup | 1.1 Initialize Next.js project, 1.2 Configure TypeScript, 1.3 Set up TailwindCSS, 1.4 Install all dependencies |
| 2 | Authentication | 2.1 Integrate Clerk, 2.2 Configure middleware, 2.3 Add UserButton & useUser hook, 2.4 Protect API routes |
| 3 | Database | 3.1 Set up Neon PostgreSQL, 3.2 Write Prisma schema, 3.3 Run db push, 3.4 Create Prisma client singleton, 3.5 Implement syncUser helper |
| 4 | Visual Canvas | 4.1 Install React Flow, 4.2 Create CustomNode component, 4.3 Create CustomEdge component, 4.4 Implement drag-and-drop from sidebar |
| 5 | State Management | 5.1 Create Zustand store, 5.2 Implement CRUD for nodes/edges, 5.3 Add localStorage persistence |
| 6 | Node Definitions | 6.1 Define all 14 node types, 6.2 Define config fields per node, 6.3 Assign categories and icons |
| 7 | Node Config Panel | 7.1 Build right-side panel, 7.2 Render dynamic form fields, 7.3 Handle file uploads to base64, 7.4 Show last output, 7.5 Add download buttons |
| 8 | Executor Engine | 8.1 Sequential execution chain, 8.2 Template variable replacement, 8.3 Loop iteration logic, 8.4 Error handling |
| 9 | AI Integration | 9.1 AI API route with Gemini, 9.2 Text generator, 9.3 Content analyzer, 9.4 Chatbot, 9.5 Data extractor |
| 10 | Email Integration | 10.1 Email API route, 10.2 Nodemailer transporter, 10.3 Dynamic attachments, 10.4 Uploaded file attachments |
| 11 | Excel Integration | 11.1 Excel Reader node (parse xlsx), 11.2 Excel Writer node (generate xlsx), 11.3 Column mapping support |
| 12 | HTTP Proxy | 12.1 Server-side proxy to avoid CORS, 12.2 Support GET/POST/PUT/DELETE |
| 13 | Telegram Trigger | 13.1 Fetch updates from Telegram Bot API, 13.2 Filter messages by recency, 13.3 Acknowledge updates |
| 14 | Dashboard | 14.1 List saved workflows, 14.2 Load workflow into editor, 14.3 Delete workflow, 14.4 Stats cards |
| 15 | Landing Page | 15.1 Hero section, 15.2 Feature cards, 15.3 Animated preview, 15.4 CTA buttons |
| 16 | Testing | 16.1 Unit tests for executor, 16.2 Integration tests for API routes, 16.3 Manual UI testing |
| 17 | Documentation | 17.1 Write README files (all chapters), 17.2 Add inline code comments |

---

## 2.3 Gantt Chart

The following Gantt chart shows the approximate timeline in calendar weeks.

```
Task                        | Week 1 | Week 2 | Week 3 | Week 4 |
----------------------------|--------|--------|--------|--------|
1. Project Setup            | ██████ |        |        |        |
2. Authentication           | ██████ |        |        |        |
3. Database                 | ██████ |        |        |        |
4. Visual Canvas            | ████   | ██     |        |        |
5. State Management         | ████   | ██     |        |        |
6. Node Definitions         |        | ██████ |        |        |
7. Node Config Panel        |        | ██████ | ██     |        |
8. Executor Engine          |        | ████   | ████   |        |
9. AI Integration           |        |        | ██████ |        |
10. Email Integration       |        |        | ████   |        |
11. Excel Integration       |        |        | ████   |        |
12. HTTP Proxy              |        |        | ██     |        |
13. Telegram Trigger        |        |        | ██     |        |
14. Dashboard               |        |        | ████   | ██     |
15. Landing Page            |        |        |        | ██████ |
16. Testing                 |        |        | ██     | ██████ |
17. Documentation           |        |        |        | ██████ |
```

Each `██` block represents approximately 2 days of work.

---

## 2.4 PERT Chart / CPM

The **Critical Path Method (CPM)** identifies which tasks must finish before others can begin. Below is the dependency chain:

```
Project Setup (1)
       │
       ├──► Authentication (2) ──► Dashboard (14) ──► Landing Page (15)
       │
       ├──► Database (3) ──► Dashboard (14)
       │
       └──► Visual Canvas (4)
                  │
                  └──► State Management (5)
                              │
                              └──► Node Definitions (6)
                                          │
                                          ├──► Node Config Panel (7)
                                          │              │
                                          │              └──► Excel Integration (11)
                                          │
                                          └──► Executor Engine (8)
                                                       │
                                                       ├──► AI Integration (9)
                                                       ├──► Email Integration (10)
                                                       ├──► HTTP Proxy (12)
                                                       └──► Telegram Trigger (13)
                                                                    │
                                                                    └──► Testing (16)
                                                                                │
                                                                                └──► Documentation (17)
```

**Critical Path:**
`Project Setup → Visual Canvas → State Management → Node Definitions → Executor Engine → AI Integration → Testing → Documentation`

**Estimated duration of critical path:** ~4 weeks (longest chain)

**PERT Expected Time Formula:** `te = (to + 4tm + tp) / 6`

| Task | Optimistic (to) | Most Likely (tm) | Pessimistic (tp) | Expected (te) |
|------|----------------|-----------------|-----------------|---------------|
| Project Setup | 1 day | 2 days | 3 days | 2 days |
| Authentication | 1 day | 2 days | 4 days | 2.2 days |
| Database | 1 day | 2 days | 3 days | 2 days |
| Visual Canvas | 2 days | 3 days | 5 days | 3.2 days |
| Executor Engine | 3 days | 5 days | 8 days | 5.2 days |
| AI Integration | 2 days | 3 days | 5 days | 3.2 days |
| Testing | 2 days | 3 days | 5 days | 3.2 days |
| Documentation | 3 days | 5 days | 7 days | 5 days |

**Total expected project duration (critical path): ~26 days (~4 weeks)**

---

## 2.5 Team Structure and Responsibilities

**Table 2.4 — Team Roles and Responsibilities**

| Role | Responsibility |
|------|---------------|
| **Full-Stack Developer / Lead** | Architecture design, Next.js setup, API routes, executor engine, database schema |
| **Frontend Developer** | React Flow canvas, Sidebar, Node Config Panel, Dashboard, Landing Page UI |
| **AI Integration Developer** | Google Gemini API integration, prompt engineering for all 4 AI node types |
| **QA / Test Engineer** | Writing test cases, running unit tests, manual UI testing, documenting bugs |
| **Technical Writer** | Writing all documentation chapters (this set of README files) |

> **Note:** In a college project setting, one or two students often take on multiple of these roles.

---

## 2.6 Project Development Methodology

AgentFlow uses a **hybrid Agile + iterative** methodology:

### Why Agile?

The requirements for this project — especially around AI capabilities — evolved over time. Early on, we weren't sure which AI features would be most useful. Agile allowed us to build a small working version, test it, and add features based on what we learned.

### Sprint Structure

Each week was treated as a **1-week sprint**:

1. **Sprint Planning (Monday):** Decide which features to build this week.
2. **Daily Development:** Write code, commit often, review each other's work.
3. **Sprint Review (Friday):** Demo what was built, test it manually.
4. **Sprint Retrospective:** Identify what went well and what needs improvement.

### Version Control

Git with GitHub was used throughout the project. All feature work was done on separate branches and merged to `main` via pull requests.

### Key Principles Applied

- **Fail fast:** If a third-party API (like Telegram) was too complex, we built a simpler version first and improved it later.
- **Single Responsibility:** Each file in the codebase does one thing. `executor.ts` executes nodes. `store.ts` manages state. `node-definitions.ts` defines node metadata.
- **DRY (Don't Repeat Yourself):** Template variable replacement is implemented in one place (`replaceTemplateVariables`) and reused across all node executors.

---

## 2.7 Hardware and Software Requirements

### Hardware Requirements

**Table 2.2 — Hardware Requirements**

| Component | Minimum Requirement | Recommended |
|-----------|--------------------|-|
| Processor | Intel Core i3 / AMD Ryzen 3 | Intel Core i5+ / AMD Ryzen 5+ |
| RAM | 4 GB | 8 GB or more |
| Storage | 5 GB free space (for node_modules) | 10 GB SSD |
| Internet | Stable broadband (for Gemini API calls) | Fiber / 50 Mbps+ |
| Display | 1366 × 768 | 1920 × 1080 (Full HD) |

### Software Requirements (Development)

**Table 2.3 — Software Requirements**

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | v18.x or later | JavaScript runtime |
| npm | v9.x or later | Package manager |
| Git | v2.x | Version control |
| VS Code | Latest | Code editor |
| Chrome / Firefox | Latest | Testing the browser UI |
| PostgreSQL client (optional) | Any | Inspecting the database |

### Software Requirements (Deployment / Cloud Services)

| Service | Purpose | Free Tier Available? |
|---------|---------|----------------------|
| [Neon.tech](https://neon.tech) | Serverless PostgreSQL database | ✅ Yes |
| [Clerk.com](https://clerk.com) | User authentication | ✅ Yes |
| [Google AI Studio](https://aistudio.google.com) | Gemini API key | ✅ Yes |
| Gmail (or any SMTP) | Sending emails via Nodemailer | ✅ Yes |
| [Vercel](https://vercel.com) | Hosting the Next.js app | ✅ Yes |

### Key npm Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.0.1 | Full-stack web framework |
| `react` | 19.2.0 | UI rendering library |
| `reactflow` | ^11.11.4 | Visual workflow canvas |
| `zustand` | ^5.0.8 | Global client state |
| `@clerk/nextjs` | ^7.3.3 | Authentication |
| `@prisma/client` | ^7.8.0 | Database ORM |
| `@google/generative-ai` | ^0.24.1 | Google Gemini AI |
| `nodemailer` | ^8.0.7 | Email sending |
| `xlsx` | ^0.18.5 | Excel file parsing |
| `tailwindcss` | ^4 | Utility CSS |
| `lucide-react` | ^0.552.0 | Icon library |
| `zod` | ^4.1.12 | Schema validation |

---

*← [Chapter 1 — Introduction](./01-introduction.md) | Next: [Chapter 3 — System Analysis →](./03-system-analysis.md)*
