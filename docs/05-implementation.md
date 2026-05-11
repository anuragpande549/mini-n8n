# Chapter 5 — Implementation

---

## 5.1 Source Code

This section walks through the key source files, explaining what they do and *why* they are written the way they are.

---

### `lib/types.ts` — TypeScript Type Definitions

This file is the foundation of the entire codebase. It defines the data shapes that every other file agrees on.

```typescript
// NodeType is a union of all 14 valid node type strings.
// If you add a new node, you MUST add its type string here first.
export type NodeType =
  | "webhook"       | "schedule"      | "telegramTrigger"
  | "aiTextGenerator" | "aiAnalyzer"  | "aiChatbot" | "aiDataExtractor"
  | "httpRequest"   | "dataTransform" | "sendEmail"
  | "ifElse"        | "delay"         | "loop"
  | "excelReader"   | "excelWriter";

// NodeData is what lives inside each node's .data property on the canvas
export interface NodeData {
  label: string;
  type: NodeType;
  config?: Record<string, any>;  // User-configured values
  output?: any;                  // Result from last execution
  isExecuting?: boolean;         // Shows a spinner on the node
  error?: string;                // Red border + error message
}

// NodeExecutionResult is what every executor function returns
export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}
```

**Why this matters:** TypeScript's strict typing catches bugs at compile time. If a developer accidentally passes a string where a `NodeType` is expected, the build fails immediately — no runtime surprises.

---

### `lib/node-definitions.ts` — Node Catalog

This file is the **single source of truth** for everything about each node type: its label, icon, color, category, default configuration, and what input fields should appear in the config panel.

```typescript
// Example: How a node definition looks
webhook: {
  type: "webhook",
  label: "Webhook Trigger",
  description: "Triggers workflow when receiving HTTP request",
  category: "trigger",          // Groups it in the sidebar
  icon: Webhook,                // Lucide icon component
  color: "bg-blue-500",         // Used for the node's header color
  defaultConfig: {
    method: "POST",
    path: "/webhook",
  },
  configFields: [
    {
      name: "method",           // Config key in node.data.config
      label: "HTTP Method",     // Shown in the config panel
      type: "select",           // Renders as a <select> dropdown
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
      ],
      defaultValue: "POST",
    },
    {
      name: "path",
      label: "Webhook Path",
      type: "text",             // Renders as <input type="text">
      placeholder: "/webhook",
      defaultValue: "/webhook",
    },
  ],
},
```

**The 14 Node Types and Their Categories:**

| Category | Node | Color |
|----------|------|-------|
| **trigger** | Webhook Trigger | Blue |
| **trigger** | Schedule Trigger | Purple |
| **trigger** | Telegram Trigger | Sky Blue |
| **ai** | AI Text Generator | Pink → Purple gradient |
| **ai** | AI Content Analyzer | Cyan → Blue gradient |
| **ai** | AI Chatbot | Green → Emerald gradient |
| **ai** | AI Data Extractor | Orange → Red gradient |
| **action** | HTTP Request | Green |
| **action** | Data Transform | Yellow |
| **action** | Send Email | Red |
| **action** | Excel Reader | Emerald Dark |
| **action** | Excel Writer | Emerald |
| **logic** | If/Else | Indigo |
| **logic** | Delay | Gray |
| **logic** | Loop | Pink |

---

### `lib/executor.ts` — The Execution Engine

This is the most complex file in the project. It contains `WorkflowExecutor` — a class that knows how to run every type of node.

**Key function: `replaceTemplateVariables`**

```typescript
// This function resolves {{input.fieldName}} placeholders
// It handles two cases:
// 1. Exact match: "{{input.items}}" → returns the actual array object
// 2. String interpolation: "Hello {{input.name}}!" → "Hello John!"

export function replaceTemplateVariables(text: any, input: any): any {
  if (typeof text !== "string") return text;

  // Case 1: The ENTIRE string is one placeholder
  // We return the raw value (preserves arrays, objects)
  const exactMatch = text.match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (exactMatch) {
    const path = exactMatch[1].trim().toLowerCase();
    if (path === "input") return input;
    if (path.startsWith("input.")) {
      // Walk the object path: "input.a.b" → input["a"]["b"]
      const fields = path.substring(6).split(".");
      let result = input;
      for (const field of fields) {
        if (result && typeof result === "object") result = result[field];
        else return text; // Path doesn't exist
      }
      return result !== undefined ? result : text;
    }
  }

  // Case 2: Replace all {{...}} patterns within a longer string
  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    // ... similar traversal but returns stringified values
  });
}
```

**Why exact match matters:** If you write `{{input.items}}` in the "Array to Iterate" field of a Loop node, you need the actual JavaScript array — not the string `"[{...}]"`. The exact match check handles this correctly.

---

### `lib/store.ts` — Global State (Zustand)

```typescript
export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,

      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

      updateNode: (id, data) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        ),
      })),

      deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== id),
        // Also delete all edges connected to this node!
        edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      })),
      // ...more methods
    }),
    {
      name: "n8n-workflow-storage", // localStorage key
    }
  )
);
```

**Why Zustand over Redux?** Zustand has almost zero boilerplate. You define your state and update functions in one place. The `persist` middleware automatically saves to `localStorage` so the canvas state survives page refreshes.

---

### `app/api/ai/execute/route.ts` — AI API Route

This server-side route accepts POST requests from the executor and calls Google Gemini. It **never runs in the browser** — this is critical for API key security.

```typescript
export async function POST(request: NextRequest) {
  const { type, config, input } = await request.json();

  // Key check happens HERE, on the server — never visible to the browser
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = "gemini-2.5-flash-lite";

  // Dispatch to the right function based on node type
  switch (type) {
    case "aiTextGenerator":
      return NextResponse.json(await executeTextGenerator(config, input, genAI, modelName));
    case "aiAnalyzer":
      return NextResponse.json(await executeAnalyzer(config, input, genAI, modelName));
    // ...etc
  }
}
```

---

### `app/api/email/send/route.ts` — Email API Route

Uses Nodemailer to send real emails. Supports plain text, HTML, and base64-encoded file attachments.

```typescript
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT),
  secure: parseInt(SMTP_PORT) === 465, // SSL for port 465
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// Dynamic attachments from uploaded files
if (uploadedFiles && Array.isArray(uploadedFiles)) {
  for (const file of uploadedFiles) {
    let base64Data = file.content;
    if (base64Data.includes("base64,")) {
      base64Data = base64Data.split("base64,")[1]; // Strip data URL prefix
    }
    mailOptions.attachments.push({
      filename: file.name,
      content: base64Data,
      encoding: 'base64',
      contentType: file.type
    });
  }
}
```

---

## 5.2 Integration of Modules / Files

The following table shows how each file depends on others:

**Table 5.2 — Module Integration Map**

| File | Imports From | Provides To |
|------|-------------|------------|
| `lib/types.ts` | `reactflow` (Node, Edge) | All other files |
| `lib/node-definitions.ts` | `lucide-react` (icons) | `Sidebar`, `NodeConfigPanel`, `executor.ts`, `editor/page.tsx` |
| `lib/store.ts` | `zustand`, `reactflow`, `lib/types.ts` | `editor/page.tsx`, `dashboard/page.tsx`, `NodeConfigPanel.tsx` |
| `lib/executor.ts` | `lib/types.ts`, `lib/node-definitions.ts`, `xlsx` | `editor/page.tsx` |
| `lib/db.ts` | `@prisma/client` | All `/api/tasks/*` routes |
| `lib/syncUser.ts` | `@clerk/nextjs/server`, `lib/db.ts` | All `/api/tasks/*` routes |
| `app/api/ai/execute/route.ts` | `@google/generative-ai`, `next/server` | `lib/executor.ts` (called via fetch) |
| `app/api/email/send/route.ts` | `nodemailer`, `next/server` | `lib/executor.ts` (called via fetch) |
| `app/api/http-proxy/route.ts` | `next/server` | `lib/executor.ts` (called via fetch) |
| `app/api/tasks/route.ts` | `lib/db.ts`, `lib/syncUser.ts` | `dashboard/page.tsx` |
| `components/Sidebar.tsx` | `lib/node-definitions.ts`, `lib/store.ts` | `editor/page.tsx` |
| `components/NodeConfigPanel.tsx` | `lib/store.ts`, `lib/node-definitions.ts` | `editor/page.tsx` |
| `components/CustomNode.tsx` | `lib/node-definitions.ts`, `lib/store.ts` | `editor/page.tsx` (via nodeTypes) |
| `editor/page.tsx` | All components, `lib/executor.ts`, `lib/store.ts` | (Top-level page) |
| `dashboard/page.tsx` | `lib/store.ts`, Clerk hooks | (Top-level page) |

### Data Flow During Workflow Execution

```
User clicks "Run Workflow"
        ↓
editor/page.tsx: executeWorkflow()
        ↓
reads from Zustand: useWorkflowStore.getState()
        ↓
finds trigger nodes (nodes with no incoming edges)
        ↓
calls executor.executeNode() for each trigger
        ↓
WorkflowExecutor.executeNode() (lib/executor.ts)
        │
        ├── if AI node → fetch("/api/ai/execute") → Gemini API
        ├── if email → fetch("/api/email/send") → Nodemailer → SMTP
        ├── if http → fetch("/api/http-proxy") → Target API
        ├── if excel reader → parse XLSX in-browser
        ├── if excel writer → generate XLSX in-browser
        └── if logic → compute locally
        ↓
result returned to executeWorkflow()
        ↓
updateNode(nodeId, { output, isExecuting: false }) → Zustand
        ↓
React re-renders the canvas with updated node state
        ↓
executeNodeChain(nextNodeId, result.output) for each connected node
        ↓
...repeats until all nodes are executed
```

---

## 5.3 Screenshots / Reports / Dataset Details

### API Endpoint Reference

**Table 5.1 — API Endpoint Reference**

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| `POST` | `/api/ai/execute` | ❌ No | Execute an AI node (Gemini) |
| `POST` | `/api/email/send` | ❌ No (called server-side) | Send email via SMTP |
| `POST` | `/api/http-proxy` | ❌ No (called server-side) | Proxy HTTP request |
| `GET` | `/api/tasks` | ✅ Yes (Clerk) | Get all workflows for current user |
| `POST` | `/api/tasks` | ✅ Yes (Clerk) | Save a new workflow |
| `GET` | `/api/tasks/:id` | ✅ Yes (Clerk) | Get a specific workflow |
| `PUT` | `/api/tasks/:id` | ✅ Yes (Clerk) | Update a workflow |
| `DELETE` | `/api/tasks/:id` | ✅ Yes (Clerk) | Delete a workflow |

### Example API Calls with curl

**Save a workflow:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-session-token>" \
  -d '{
    "name": "My First Agent",
    "description": "Sends a welcome email",
    "workflowData": {
      "nodes": [...],
      "edges": [...]
    }
  }'
```

**Execute an AI Text Generator:**
```bash
curl -X POST http://localhost:3000/api/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "aiTextGenerator",
    "config": {
      "prompt": "Write a haiku about programming",
      "temperature": "0.8",
      "maxTokens": "100"
    },
    "input": {}
  }'
```

**Expected response:**
```json
{
  "generatedText": "Syntax errors bloom\nDebugging in the late night\nFinally it works",
  "model": "gemini-2.5-flash-lite",
  "usage": {
    "promptTokenCount": 10,
    "candidatesTokenCount": 18
  }
}
```

### Using Template Variables — Examples

**Example 1: Loop + AI Email**

Workflow: `Excel Reader → Loop → AI Text Generator → Send Email`

Excel file has columns: `name`, `email`

- **Loop node config:** `Array to Iterate = {{input.items}}`
- **AI Text Generator config:** `Prompt = Write a personalized welcome email for {{input.item.name}}`
- **Send Email config:**
  - `To = {{input.item.email}}`
  - `Subject = Welcome, {{input.item.name}}!`
  - `Body = {{input.generatedText}}`

**Example 2: HTTP Request → Data Transform → Send Email**

- **HTTP Request config:** `URL = https://jsonplaceholder.typicode.com/posts/1`
- **Data Transform code:** `return { title: input.response.title, summary: input.response.body.substring(0, 50) };`
- **Send Email config:** `Body = New post: {{input.title}}. Summary: {{input.summary}}`

**Example 3: If/Else Branching**

- **If/Else config:**
  - Condition: `input.value > 100`
  - Operator: `JavaScript Expression`
- On the `true` branch: connect a Send Email node
- On the `false` branch: connect a different HTTP Request

---

*← [Chapter 4 — System Design](./04-system-design.md) | Next: [Chapter 6 — System Testing →](./06-system-testing.md)*
