# Chapter 3 — System Analysis

---

## 3.1 Problem Description

### 3.1.1 Problem Definition

Modern software systems increasingly depend on connecting multiple services together: fetching data from one API, transforming it, sending it to an AI model, and delivering the result via email or messaging. Building these pipelines requires:

- **Knowledge of multiple programming languages and APIs**
- **Understanding of asynchronous execution** (promises, async/await)
- **Ability to handle errors gracefully** from third-party services
- **Time and infrastructure** to host and maintain the code

For students, small business owners, and non-technical users, these barriers are too high. Even experienced developers find themselves writing repetitive "glue code" to wire together services they use every day.

Additionally, with the rise of AI, users want to **incorporate LLM capabilities** (text generation, summarization, sentiment analysis) directly into their automation pipelines — but most existing tools either don't support this or charge a premium for it.

**Summary of the problem:**
> *There is no easy-to-use, open-source, self-hosted platform that lets users visually build AI-powered automation workflows, process files like Excel spreadsheets, send emails, call external APIs, and run conditional logic — all without writing code.*

---

### 3.1.2 Proposed Solution

**AgentFlow** solves this by providing:

1. **A visual drag-and-drop canvas** (powered by React Flow) where users can add "nodes" representing tasks and connect them with arrows representing data flow.

2. **14 pre-built node types** that cover the most common automation tasks:
   - Fetch data (Webhook Trigger, Schedule, Telegram Trigger)
   - Process with AI (Text Generator, Analyzer, Chatbot, Data Extractor)
   - Take action (Send Email, HTTP Request, Excel Reader, Excel Writer, Data Transform)
   - Control flow (If/Else, Delay, Loop)

3. **A template variable system** using `{{input.fieldName}}` syntax that passes data from one node's output into another node's configuration — without any code.

4. **A cloud-synced dashboard** where users can save their workflow agents, reload them later, and manage all their automations in one place.

5. **Secure authentication** so each user's workflows are private and persistent.

---

## 3.2 Requirements

### 3.2.1 Functional Requirements

**Table 3.1 — Functional Requirements**

| ID | Requirement | Priority |
|----|------------|---------|
| FR-01 | Users must be able to sign up, sign in, and sign out using email or social login. | High |
| FR-02 | Users must be able to drag node types from the sidebar and drop them onto the canvas. | High |
| FR-03 | Users must be able to connect two nodes by dragging from the output port of one to the input port of another. | High |
| FR-04 | Users must be able to double-click a node to open its configuration panel. | High |
| FR-05 | The config panel must render the correct input fields for each node type (text, number, select, textarea, file). | High |
| FR-06 | Users must be able to run a `{{input.fieldName}}` template variable in any text config field to reference upstream node output. | High |
| FR-07 | The system must execute workflow nodes in order, starting from trigger nodes (nodes with no incoming connections). | High |
| FR-08 | The AI Text Generator node must use Google Gemini to generate text from a user-provided prompt. | High |
| FR-09 | The AI Content Analyzer node must analyze text for sentiment, keywords, or summary using Google Gemini. | High |
| FR-10 | The AI Chatbot node must generate chatbot responses using Google Gemini with configurable system prompt and personality. | Medium |
| FR-11 | The AI Data Extractor node must extract structured JSON data from unstructured text using Google Gemini. | Medium |
| FR-12 | The Send Email node must send real emails via SMTP using Nodemailer. | High |
| FR-13 | The Send Email node must support dynamic `To`, `Subject`, and `Body` fields with template variables. | High |
| FR-14 | The Send Email node must support file attachments (both uploaded files and dynamically generated content). | Medium |
| FR-15 | The HTTP Request node must call any external REST API with configurable method, URL, headers, and body. | High |
| FR-16 | HTTP requests must be routed through a server-side proxy to avoid CORS restrictions. | High |
| FR-17 | The Excel Reader node must parse an uploaded `.xlsx` or `.csv` file and output its rows as a JSON array. | High |
| FR-18 | The Excel Writer node must generate a downloadable `.xlsx` file from a JSON array with optional column mapping. | Medium |
| FR-19 | The Telegram Trigger node must fetch unread messages from a Telegram Bot and output them as an array. | Medium |
| FR-20 | The Loop node must iterate over an array and execute downstream nodes once per item. | High |
| FR-21 | The If/Else node must evaluate a condition (JavaScript or equality) and set the output branch accordingly. | High |
| FR-22 | The Delay node must pause execution for a specified duration before proceeding. | Low |
| FR-23 | The Data Transform node must execute custom user-provided JavaScript and pass the result downstream. | Medium |
| FR-24 | Users must be able to save their current workflow with a name and description. | High |
| FR-25 | The dashboard must list all saved workflows for the authenticated user, ordered by last-modified date. | High |
| FR-26 | Users must be able to load a saved workflow into the editor. | High |
| FR-27 | Users must be able to delete a saved workflow. | Medium |
| FR-28 | All API routes (except AI execute and landing page) must be protected by authentication. | High |
| FR-29 | Each node must visually show its execution status (idle, running, success, error) on the canvas. | High |
| FR-30 | Users must be able to download node output as a `.txt` file or as an `.xlsx` file (for Excel Writer). | Medium |

---

### 3.2.2 Non-Functional Requirements

**Table 3.2 — Non-Functional Requirements**

| ID | Category | Requirement |
|----|---------|------------|
| NFR-01 | Performance | The workflow editor canvas must render smoothly at 60 FPS for workflows with up to 20 nodes. |
| NFR-02 | Performance | AI API calls must return within 10 seconds for normal prompt lengths. |
| NFR-03 | Scalability | The database schema must support any number of users and workflows without modification. |
| NFR-04 | Security | API keys (Gemini, SMTP, Clerk, DB) must never be exposed to the client browser. |
| NFR-05 | Security | All private API routes must reject unauthenticated requests with HTTP 401. |
| NFR-06 | Security | The HTTP Proxy must validate that the target URL is a valid URL before forwarding requests. |
| NFR-07 | Usability | The drag-and-drop canvas must be intuitive enough for a first-time user to create a 3-node workflow in under 5 minutes. |
| NFR-08 | Usability | Error messages must be human-readable and displayed on the relevant node on the canvas. |
| NFR-09 | Reliability | The email sending API must return a specific error message when SMTP credentials are missing or wrong. |
| NFR-10 | Reliability | The workflow executor must catch errors in individual nodes and mark them as failed without crashing the entire workflow. |
| NFR-11 | Maintainability | Adding a new node type must require changes in only 2 files: `node-definitions.ts` (definition) and `executor.ts` (execution logic). |
| NFR-12 | Compatibility | The application must work on Chrome, Firefox, and Edge on desktop. |
| NFR-13 | Accessibility | All interactive elements must have visible focus states and meaningful labels. |
| NFR-14 | Data Integrity | Workflow data saved to the database must exactly reproduce the same canvas state when loaded back. |
| NFR-15 | Portability | The application must be deployable to Vercel without any environment-specific code changes. |

---

## 3.3 Problem Analysis Diagrams

### 3.3.1 Data Flow Diagram / Process Flow Diagram

#### Level 0 DFD (Context Diagram)

```
                ┌─────────────────────────────────────────────┐
                │                                             │
  [User] ──────►│          AgentFlow System                   │──────► [Google Gemini AI]
                │                                             │
  [User] ◄──────│  (Receives: workflow commands, config)     │◄────── [Neon PostgreSQL DB]
                │  (Returns: execution results, saved agents) │
                │                                             │──────► [SMTP Email Server]
                │                                             │
                │                                             │──────► [Telegram API]
                │                                             │
                │                                             │──────► [External APIs]
                └─────────────────────────────────────────────┘
```

#### Level 1 DFD (System Decomposition)

```
[User]
  │
  ├──► (1.0) Authentication Process
  │        │── [Clerk] validates credentials
  │        └── Returns: Session Token
  │
  ├──► (2.0) Workflow Editor Process
  │        │── Input: Drag & drop actions, node config
  │        │── Store: Zustand (in-browser state)
  │        └── Output: Canvas with nodes and edges
  │
  ├──► (3.0) Workflow Execution Process
  │        │── Input: Current nodes + edges from Zustand
  │        │── Processes: Each node in topological order
  │        │── Sub-processes:
  │        │     ├── (3.1) Execute Trigger Node
  │        │     ├── (3.2) Execute AI Node → [Gemini API]
  │        │     ├── (3.3) Execute Email Node → [SMTP Server]
  │        │     ├── (3.4) Execute HTTP Node → [External API]
  │        │     ├── (3.5) Execute Excel Node
  │        │     └── (3.6) Execute Logic Node (If/Loop/Delay)
  │        └── Output: Node outputs displayed on canvas
  │
  ├──► (4.0) Save Workflow Process
  │        │── Input: Workflow name, description, nodes + edges JSON
  │        │── Store: [Neon PostgreSQL] via Prisma
  │        └── Output: Saved AgentTask record
  │
  └──► (5.0) Dashboard Process
           │── Input: User's clerkId
           │── Reads: [Neon PostgreSQL] AgentTask records
           └── Output: List of saved workflows
```

---

### 3.3.2 Use Case Diagram and Sequence Diagram

#### Use Case Diagram

```
                          ┌──────────────────────────────────┐
                          │         AgentFlow System         │
                          │                                  │
  ┌──────────┐            │  ○ Sign Up / Sign In             │
  │          │────────────►  ○ View Dashboard                │
  │          │            │  ○ Create New Workflow            │
  │  User    │────────────►  ○ Add Node to Canvas            │
  │ (Clerk   │            │  ○ Connect Nodes                 │
  │  Auth)   │────────────►  ○ Configure Node                │
  │          │            │  ○ Upload File (Excel/Attachment) │
  │          │────────────►  ○ Execute Workflow               │
  │          │            │  ○ View Node Output              │
  │          │────────────►  ○ Download Output File          │
  │          │            │  ○ Save Workflow Agent            │
  │          │────────────►  ○ Load Saved Workflow            │
  │          │            │  ○ Delete Workflow                │
  └──────────┘            │  ○ Sign Out                      │
                          └──────────────────────────────────┘
                                    │
                    ┌───────────────┼────────────────────┐
                    ▼               ▼                    ▼
             ┌────────────┐  ┌───────────┐       ┌────────────┐
             │ Google     │  │   Neon    │       │   SMTP /   │
             │ Gemini AI  │  │ PostgreSQL│       │  Telegram  │
             └────────────┘  └───────────┘       └────────────┘
```

#### Sequence Diagram — Workflow Execution

```
User          Editor Page     Zustand Store    WorkflowExecutor    API Routes       External
  │                │                │                  │                │           Services
  │ Click "Run"    │                │                  │                │              │
  ├───────────────►│                │                  │                │              │
  │                │ getState()     │                  │                │              │
  │                ├───────────────►│                  │                │              │
  │                │◄── nodes+edges─┤                  │                │              │
  │                │                │                  │                │              │
  │                │ executeNode()  │                  │                │              │
  │                ├────────────────┼─────────────────►│                │              │
  │                │                │                  │                │              │
  │                │                │                  │ [Trigger Node] │              │
  │                │                │                  │ → output data  │              │
  │                │                │                  │                │              │
  │                │                │                  │ [AI Node]      │              │
  │                │                │                  │ POST /api/ai/execute          │
  │                │                │                  ├───────────────►│              │
  │                │                │                  │                │ Gemini API   │
  │                │                │                  │                ├─────────────►│
  │                │                │                  │                │◄── response ─┤
  │                │                │                  │◄── AI result ──┤              │
  │                │                │                  │                │              │
  │                │                │ updateNode()     │                │              │
  │                │                │◄─────────────────┤                │              │
  │                │                │ (output + status)│                │              │
  │                │◄───────────────┤                  │                │              │
  │ [Node glows]   │                │                  │                │              │
  │◄───────────────┤                │                  │                │              │
```

---

## 3.4 Database Schema

The database has two tables: `User` and `AgentTask`.

### Table 3.3 — User Table

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | `String` (UUID) | PRIMARY KEY, auto-generated | Internal DB row identifier |
| `clerkId` | `String` | UNIQUE, NOT NULL | Clerk's user ID (used as the FK for tasks) |
| `email` | `String` | UNIQUE, NOT NULL | User's email address |
| `name` | `String` | NULLABLE | User's display name |
| `createdAt` | `DateTime` | DEFAULT now() | Account creation timestamp |
| `updatedAt` | `DateTime` | Auto-updated | Last update timestamp |

### Table 3.4 — AgentTask Table

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | `String` (UUID) | PRIMARY KEY, auto-generated | Workflow unique identifier |
| `name` | `String` | NOT NULL | User-provided workflow name |
| `description` | `String` | NULLABLE | Optional description |
| `workflowData` | `Json` | NOT NULL | Full node + edge graph as JSON |
| `userId` | `String` | FK → User.clerkId, CASCADE DELETE | Owner of the workflow |
| `createdAt` | `DateTime` | DEFAULT now() | Creation timestamp |
| `updatedAt` | `DateTime` | Auto-updated | Last saved timestamp |

### Prisma Schema (actual code)

```prisma
model User {
  id        String      @id @default(uuid())
  clerkId   String      @unique
  email     String      @unique
  name      String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  tasks     AgentTask[]
}

model AgentTask {
  id           String   @id @default(uuid())
  name         String
  description  String?
  workflowData Json
  userId       String
  user         User     @relation(fields: [userId], references: [clerkId], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Relationship

- One `User` can have **many** `AgentTask` records (1:N relationship).
- When a `User` is deleted, all their `AgentTask` records are automatically deleted (`onDelete: Cascade`).
- The foreign key uses `clerkId` (not `id`) as the reference because Clerk provides this string as the primary identifier in JWT tokens, making server-side lookup easier without an extra DB join.

### Sample Data

**User Record Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerkId": "user_2abc123xyz",
  "email": "student@university.edu",
  "name": "Anurag Kumar",
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-01T10:00:00Z"
}
```

**AgentTask Record Example:**
```json
{
  "id": "7f3e9c12-d456-7890-abcd-ef0123456789",
  "name": "Bulk Email Campaign",
  "description": "Read contacts from Excel, generate personalized emails with AI, send them",
  "workflowData": {
    "nodes": [
      {
        "id": "node-abc",
        "type": "custom",
        "position": { "x": 100, "y": 200 },
        "data": {
          "label": "Excel Reader",
          "type": "excelReader",
          "config": { "uploadedFiles": [] }
        }
      }
    ],
    "edges": []
  },
  "userId": "user_2abc123xyz",
  "createdAt": "2026-05-10T15:30:00Z",
  "updatedAt": "2026-05-10T15:30:00Z"
}
```

---

*← [Chapter 2 — Project Planning](./02-project-planning.md) | Next: [Chapter 4 — System Design →](./04-system-design.md)*
