# Chapter 4 — System Design

---

## 4.1 System Architecture

AgentFlow follows a **modern full-stack monorepo architecture** using Next.js's App Router. All frontend pages, API routes, database access, and business logic live in a single repository and are deployed as one unit.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                                                                     │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │  Landing Page  │  │   Dashboard    │  │   Workflow Editor    │  │
│  │  (app/page.tsx)│  │ (dashboard/    │  │  (editor/page.tsx)  │  │
│  │               │  │  page.tsx)     │  │                      │  │
│  │  React 19     │  │  Clerk user    │  │  React Flow canvas  │  │
│  │  Tailwind CSS │  │  Saved agents  │  │  Zustand store      │  │
│  └───────────────┘  └────────────────┘  └──────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Zustand Global State                       │  │
│  │  nodes[], edges[], selectedNodeId, addNode, updateNode...    │  │
│  │  Persisted to localStorage ("n8n-workflow-storage")          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP (fetch)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (API ROUTES)                       │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐ │
│  │ /api/ai/execute  │  │ /api/email/send  │  │ /api/http-proxy   │ │
│  │                 │  │                  │  │                   │ │
│  │  Google Gemini  │  │  Nodemailer SMTP │  │  Server-side      │ │
│  │  integration    │  │  integration     │  │  HTTP forwarder   │ │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/tasks (GET, POST) and /api/tasks/[id] (GET, PUT, DELETE)│  │
│  │  Clerk auth middleware → Prisma → Neon PostgreSQL            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────┬─────────────────────┬───────────────────────────────┘
               │                     │
               ▼                     ▼
  ┌────────────────────┐    ┌──────────────────────┐
  │  Neon PostgreSQL   │    │  External Services   │
  │  (via Prisma ORM)  │    │                      │
  │                    │    │  ● Google Gemini API  │
  │  Table: User       │    │  ● Telegram Bot API   │
  │  Table: AgentTask  │    │  ● SMTP (Gmail etc.)  │
  │                    │    │  ● Any REST API       │
  └────────────────────┘    └──────────────────────┘
               ▲
               │  Auth
  ┌────────────────────┐
  │   Clerk Auth       │
  │   (clerk.com)      │
  │                    │
  │  JWT verification  │
  │  User sync to DB   │
  └────────────────────┘
```

### Architecture Layers Explained

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| **Presentation Layer** | React 19 + Tailwind CSS | Renders UI, handles user interactions |
| **Canvas Layer** | React Flow 11 | Visual node graph with drag-and-drop |
| **State Layer** | Zustand 5 | Client-side workflow state + localStorage persistence |
| **Execution Layer** | `lib/executor.ts` | Traverses nodes, calls APIs, processes data |
| **API Layer** | Next.js API Routes | Exposes server-side endpoints for AI, email, DB |
| **Auth Layer** | Clerk | JWT session management, user sync |
| **Data Layer** | Prisma 7 + PostgreSQL | Persists users and workflows |

---

## 4.2 Physical Design

### 4.2.1 Structure Chart

The structure chart shows how the major modules call each other:

```
                        ┌──────────────────┐
                        │   Editor Page    │
                        │  (page.tsx)      │
                        └───────┬──────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
        ┌──────────┐    ┌──────────────┐    ┌──────────────┐
        │ Sidebar  │    │  ReactFlow   │    │NodeConfigPanel│
        │ Component│    │  Canvas      │    │  Component   │
        └─────┬────┘    └──────┬───────┘    └──────┬───────┘
              │                │                   │
              │ onExecute()    │                   │ updateNode()
              │                │                   │
              ▼                ▼                   ▼
      ┌───────────────────────────────────────────────────┐
      │              useWorkflowStore (Zustand)            │
      │  nodes, edges, addNode, updateNode, deleteNode...  │
      └───────────────────────┬───────────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │ WorkflowExecutor │
                   │  (executor.ts)   │
                   └───────┬──────────┘
                           │
        ┌──────────────────┼──────────────────────────┐
        ▼                  ▼              ▼            ▼
 ┌────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐
 │executeTrigger│ │executeAINode │  │executeAct│  │execute │
 │Node()      │  │Type()        │  │ionNode() │  │LogicNod│
 │            │  │              │  │          │  │e()     │
 │ - webhook  │  │ - textGen    │  │ - http   │  │ - if   │
 │ - schedule │  │ - analyzer   │  │ - email  │  │ - loop │
 │ - telegram │  │ - chatbot    │  │ - excel  │  │ - delay│
 └────────────┘  │ - dataExtract│  │ - transform  └────────┘
                 └──────┬───────┘  └──────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  /api/ai/execute │
              │  (Next.js route) │
              │                  │
              │ GoogleGenerativeAI│
              │ (Gemini SDK)     │
              └──────────────────┘
```

---

### 4.2.2 ER Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          ER DIAGRAM                                  │
│                                                                      │
│  ┌────────────────────────┐          ┌─────────────────────────────┐│
│  │         USER           │          │        AGENT_TASK           ││
│  │────────────────────────│          │─────────────────────────────││
│  │ PK  id        UUID     │          │ PK  id          UUID        ││
│  │ UK  clerkId   String   │◄─────────│ FK  userId      String      ││
│  │ UK  email     String   │  1 : N   │     name        String      ││
│  │     name      String?  │          │     description  String?    ││
│  │     createdAt DateTime │          │     workflowData Json       ││
│  │     updatedAt DateTime │          │     createdAt    DateTime   ││
│  │                        │          │     updatedAt    DateTime   ││
│  └────────────────────────┘          └─────────────────────────────┘│
│                                                                      │
│  Legend:                                                             │
│   PK = Primary Key                                                   │
│   FK = Foreign Key (references User.clerkId, CASCADE DELETE)         │
│   UK = Unique Key                                                    │
│   1:N = One User can have many AgentTasks                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 4.2.3 Class Diagram and Object Diagram

#### Class Diagram (TypeScript Interfaces)

```
┌──────────────────────────────────────────────────────────────┐
│                     <<interface>>                            │
│                       NodeData                               │
│──────────────────────────────────────────────────────────────│
│ + label: string                                              │
│ + type: NodeType                                             │
│ + config?: Record<string, any>                               │
│ + output?: any                                               │
│ + isExecuting?: boolean                                      │
│ + error?: string                                             │
└──────────────────────────────────────────────────────────────┘
                              △ extends
┌────────────────────────────────────────────────────────────────┐
│                     <<interface>>                              │
│                      WorkflowNode                              │
│────────────────────────────────────────────────────────────────│
│ (extends React Flow Node)                                      │
│ + id: string                                                   │
│ + type: "custom"                                               │
│ + position: { x: number, y: number }                          │
│ + data: NodeData                                               │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     <<interface>>                            │
│                     WorkflowState                            │
│──────────────────────────────────────────────────────────────│
│ + nodes: WorkflowNode[]                                      │
│ + edges: WorkflowEdge[]                                      │
│ + selectedNodeId: string | null                              │
│──────────────────────────────────────────────────────────────│
│ + addNode(node): void                                        │
│ + updateNode(id, data): void                                 │
│ + deleteNode(id): void                                       │
│ + addEdge(edge): void                                        │
│ + deleteEdge(id): void                                       │
│ + setNodes(nodes): void                                      │
│ + setEdges(edges): void                                      │
│ + clearWorkflow(): void                                      │
│ + setSelectedNodeId(id): void                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                       <<class>>                              │
│                    WorkflowExecutor                          │
│──────────────────────────────────────────────────────────────│
│ (no fields — stateless class)                                │
│──────────────────────────────────────────────────────────────│
│ + executeNode(context): Promise<NodeExecutionResult>         │
│ - executeTriggerNode(config, input): Promise<Result>         │
│ - executeTelegramTrigger(config, input): Promise<Result>     │
│ - executeAINodeType(config, input): Promise<Result>          │
│ - executeActionNode(config, input): Promise<Result>          │
│ - executeHttpRequest(config, input): Promise<Result>         │
│ - executeDataTransform(config, input): Result                │
│ - executeSendEmail(config, input): Promise<Result>           │
│ - executeExcelReader(config, input): Promise<Result>         │
│ - executeExcelWriter(config, input): Promise<Result>         │
│ - executeLogicNode(config, input): Promise<Result>           │
│ - executeIfElse(config, input): Result                       │
│ - executeDelay(config, input): Promise<Result>               │
│ - executeLoop(config, input): Result                         │
│ - executeAINode(type, config, input): Promise<any>           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     <<interface>>                            │
│                     NodeDefinition                           │
│──────────────────────────────────────────────────────────────│
│ + type: string                                               │
│ + label: string                                              │
│ + description: string                                        │
│ + category: "trigger" | "ai" | "action" | "logic"           │
│ + icon: React component                                      │
│ + color: string                                              │
│ + defaultConfig: Record<string, any>                         │
│ + configFields: ConfigField[]                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     <<interface>>                            │
│                       ConfigField                            │
│──────────────────────────────────────────────────────────────│
│ + name: string                                               │
│ + label: string                                              │
│ + type: "text"|"textarea"|"select"|"number"|"file"           │
│ + placeholder?: string                                       │
│ + options?: {value: string, label: string}[]                 │
│ + required?: boolean                                         │
│ + defaultValue?: any                                         │
│ + multiple?: boolean                                         │
└──────────────────────────────────────────────────────────────┘
```

#### Object Diagram (Example Workflow State)

```
workflowStore: WorkflowState {
  nodes: [
    node1: WorkflowNode {
      id: "node-abc123",
      type: "custom",
      position: { x: 100, y: 200 },
      data: {
        label: "Excel Reader",
        type: "excelReader",
        config: { uploadedFiles: [{ name: "contacts.xlsx", content: "base64..." }] },
        output: { items: [{name:"John", email:"john@test.com"}, ...] },
        isExecuting: false,
        error: undefined
      }
    },
    node2: WorkflowNode {
      id: "node-def456",
      type: "custom",
      position: { x: 400, y: 200 },
      data: {
        label: "AI Text Generator",
        type: "aiTextGenerator",
        config: { prompt: "Write a welcome email for {{input.item.name}}", temperature: "0.7" },
        output: { generatedText: "Dear John, welcome to..." },
        isExecuting: false
      }
    }
  ],
  edges: [
    edge1: WorkflowEdge {
      id: "enode-abc123-node-def456",
      source: "node-abc123",
      target: "node-def456",
      type: "custom",
      animated: true
    }
  ],
  selectedNodeId: "node-def456"
}
```

---

## 4.3 Input and Output Design

### Input Design

#### 1. Node Configuration Form Fields

Each node type defines its own input fields. Below are examples:

**Excel Reader Node — Input Fields:**
| Field | Type | Required | Example Value |
|-------|------|----------|---------------|
| Upload Excel/CSV File | file (upload) | ✅ Yes | `contacts.xlsx` |

**AI Text Generator Node — Input Fields:**
| Field | Type | Required | Example Value |
|-------|------|----------|---------------|
| Prompt | textarea | ✅ Yes | `Write a welcome email for {{input.item.name}}` |
| Temperature | number | No | `0.7` |
| Max Tokens | number | No | `500` |

**Send Email Node — Input Fields:**
| Field | Type | Required | Example Value |
|-------|------|----------|---------------|
| To | text | ✅ Yes | `{{input.item.email}}` |
| Subject | text | ✅ Yes | `Welcome to our platform!` |
| Body | textarea | ✅ Yes | `{{input.generatedText}}` |
| Attachment File Name | text | No | `report.txt` |
| Dynamic Attachment Content | textarea | No | `{{input.data}}` |
| Local Files | file (upload) | No | `invoice.pdf` |

**HTTP Request Node — Input Fields:**
| Field | Type | Required | Example Value |
|-------|------|----------|---------------|
| Method | select | ✅ Yes | `GET` |
| URL | text | ✅ Yes | `https://api.example.com/users` |
| Headers (JSON) | textarea | No | `{"Authorization": "Bearer {{input.token}}"}` |
| Body (JSON) | textarea | No | `{"query": "{{input.search}}"}` |

#### 2. Template Variable Syntax

Template variables let you reference data from upstream nodes in any text field:

| Syntax | Resolves To | Example |
|--------|------------|---------|
| `{{input}}` | The entire input object | `{"name": "John", "email": "john@test.com"}` |
| `{{input.name}}` | A top-level property | `"John"` |
| `{{input.item.email}}` | A nested property | `"john@test.com"` |
| `{{input.items}}` | An array | `[{...}, {...}, ...]` |
| `{{input.generatedText}}` | AI output field | `"Dear John, ..."` |

### Output Design

#### Node Output Format

Every node execution returns a `NodeExecutionResult`:
```typescript
interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}
```

**Example outputs per node type:**

**Trigger Node:**
```json
{
  "triggeredAt": "2026-05-11T10:00:00Z",
  "config": { "method": "POST", "path": "/webhook" }
}
```

**Excel Reader Output:**
```json
{
  "items": [
    { "Name": "Alice", "Email": "alice@test.com", "Age": 25 },
    { "Name": "Bob", "Email": "bob@test.com", "Age": 30 }
  ]
}
```

**AI Text Generator Output:**
```json
{
  "generatedText": "Dear Alice, welcome to AgentFlow! ...",
  "model": "gemini-2.5-flash-lite",
  "usage": { "promptTokenCount": 30, "candidatesTokenCount": 120 }
}
```

**Send Email Output:**
```json
{
  "sent": true,
  "to": "alice@test.com",
  "subject": "Welcome!",
  "sentAt": "2026-05-11T10:01:00Z",
  "messageId": "<abc123@mail.gmail.com>",
  "message": "✉️ Email sent successfully"
}
```

**Loop Node Output:**
```json
{
  "items": [{...}, {...}],
  "totalItems": 2,
  "originalInput": { "items": [{...}, {...}] }
}
```

**If/Else Output:**
```json
{
  "condition": true,
  "branch": "true",
  "input": { "value": 15 }
}
```

---

## 4.4 Algorithmic Design

### Algorithm 1 — Workflow Execution (Sequential Chain)

```
ALGORITHM: ExecuteWorkflow
INPUT: nodes[], edges[]
OUTPUT: Updated node states (output, error, isExecuting flags)

1. Find all trigger nodes (nodes with no incoming edges)
2. If no trigger nodes found → show alert, STOP
3. Reset all nodes (clear output, error, isExecuting flags)
4. Initialize executedNodes = empty Set
5. Initialize nodeOutputs = empty Dictionary

6. FUNCTION executeNodeChain(nodeId, input):
    a. If nodeId is already in executedNodes → RETURN (prevent cycles)
    b. Find node by nodeId
    c. If node not found → RETURN
    d. Add nodeId to executedNodes
    e. Set node.isExecuting = true
    f. Call executor.executeNode({ nodeId, input, config: node.data.config })
    g. IF result.success:
          Set node.output = result.output
          Set node.isExecuting = false
          Store nodeOutputs[nodeId] = result.output
          Find all edges where edge.source == nodeId
          IF node type is "loop" AND result.output.items is array:
              FOR EACH item in result.output.items:
                  FOR EACH outgoing edge:
                      Remove edge.target from executedNodes  // allow re-execution
                      CALL executeNodeChain(edge.target, {...result.output, item, loopIndex})
          ELSE:
              FOR EACH outgoing edge:
                  CALL executeNodeChain(edge.target, result.output)
    h. IF result fails:
          Set node.error = result.error
          Set node.isExecuting = false

7. FOR EACH triggerNode in triggerNodes:
    CALL executeNodeChain(triggerNode.id, null)

8. DONE
```

---

### Algorithm 2 — Template Variable Resolution

```
ALGORITHM: replaceTemplateVariables
INPUT: text (string), input (any)
OUTPUT: resolved string or object

1. IF text is not a string → RETURN text as-is

2. Check if text EXACTLY matches the pattern {{...}} (nothing else):
    a. Extract the path from inside {{ }}
    b. IF path == "input" → RETURN entire input object (not stringified)
    c. IF path starts with "input." → traverse object along path
        - Split "input.a.b.c" into ["a", "b", "c"]
        - Walk through the input object field by field
        - If any field doesn't exist → RETURN original text
        - RETURN the found value (could be array, object, or primitive)

3. FALLBACK: String interpolation mode
    Find all {{...}} patterns in the string
    FOR EACH pattern:
        a. IF path == "input" → replace with JSON.stringify(input)
        b. IF path starts with "input." → traverse and stringify
        c. ELSE → leave the pattern unchanged (don't replace unknown paths)
    RETURN the fully replaced string

4. DONE
```

---

### Algorithm 3 — AI Node Dispatch

```
ALGORITHM: ExecuteAINode (server-side route)
INPUT: { type, config, input } from POST /api/ai/execute
OUTPUT: JSON result from Google Gemini

1. Verify GEMINI_API_KEY exists in env → if not, return 500 error
2. Initialize GoogleGenerativeAI client with API key
3. Set modelName = "gemini-2.5-flash-lite"

4. SWITCH type:
    CASE "aiTextGenerator":
        a. Replace template variables in config.prompt using input
        b. Build Gemini model with temperature and maxOutputTokens
        c. Call model.generateContent(prompt)
        d. Return { generatedText, model, usage }

    CASE "aiAnalyzer":
        a. Replace template variables in config.text using input
        b. Build system prompt based on config.analysisType:
            - "sentiment" → "Analyze sentiment... return Positive/Negative/Neutral..."
            - "keywords"  → "Extract keywords as a JSON array..."
            - "summary"   → "Provide a concise 2-3 sentence summary..."
        c. Call model.generateContent(text)
        d. Return { analysisType, result, usage }

    CASE "aiChatbot":
        a. Replace template variables in systemPrompt and userMessage
        b. Append personality instruction to systemPrompt
        c. Call model.generateContent(userMessage)
        d. Return { response, personality, usage }

    CASE "aiDataExtractor":
        a. Replace template variables in text and schema
        b. Set responseMimeType = "application/json"
        c. Call model.generateContent(text)
        d. Parse JSON from response
        e. Return { extractedData, schema, usage }

5. Return result as JSON response
6. DONE
```

---

### Algorithm 4 — Loop Node Iteration

```
ALGORITHM: ExecuteLoop
INPUT: config.arraySource (string with template var), input
OUTPUT: { items[], totalItems, originalInput }

1. Resolve arraySource by calling replaceTemplateVariables(arraySource, input)
2. The result could be:
    a. A string → try JSON.parse()
        - If valid JSON → use as array
        - If comma-separated → split by "," and trim
        - Otherwise → wrap in array: [string]
    b. Already an array → use directly
    c. Any other type → wrap in array

3. Ensure result is an array (edge case handling)
4. Return { items: resolvedArray, totalItems: resolvedArray.length, originalInput: input }
5. DONE

NOTE: In the editor page, when a loop node's output is detected,
      the executor re-executes all downstream nodes once for each item,
      passing { ...loopOutput, item: currentItem, loopIndex: i } as input.
```

---

### Algorithm 5 — File Upload to Base64

```
ALGORITHM: handleFileUpload
INPUT: files: FileList (from <input type="file">)
OUTPUT: Array of { name, type, content: base64String }

1. Initialize newFiles = []
2. For each file in files:
    a. Check file.size <= 1MB (1 * 1024 * 1024 bytes)
       - If too large → skip and alert user
    b. Create a FileReader
    c. Call reader.readAsDataURL(file)
    d. In the onload callback:
        - result is like: "data:image/png;base64,iVBORw0KGgo..."
        - Store { name: file.name, type: file.type, content: result }
    e. Push to newFiles

3. Merge newFiles with any already-uploaded files in config
4. Store updated file list in node config via handleChange()
5. DONE

NOTE: When the Excel Reader node reads the file later,
      it strips the "data:...;base64," prefix and passes the
      raw base64 string to XLSX.read().
```

---

*← [Chapter 3 — System Analysis](./03-system-analysis.md) | Next: [Chapter 5 — Implementation →](./05-implementation.md)*
