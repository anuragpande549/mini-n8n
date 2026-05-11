# List of Algorithms

---

The following algorithms are formally described in the project report for **AgentFlow: A Visual AI Workflow Automation Platform**. Each algorithm is presented in structured pseudocode format within Chapter 4 and relevant implementation detail is provided in Chapter 5.

---

| Algorithm No. | Name | Chapter | Page |
|--------------|------|---------|------|
| Algorithm 1 | Sequential Workflow Execution Engine | 4 | 49 |
| Algorithm 2 | Loop Node Iteration with Array Data | 4 | 52 |
| Algorithm 3 | Template Variable Resolution (`{{input.key}}`) | 4 | 53 |
| Algorithm 4 | AI Node Type Dispatch (Gemini Integration) | 4 | 54 |
| Algorithm 5 | File Upload Processing and Base64 Encoding | 5 | 60 |

---

## Algorithm Summaries

### Algorithm 1 — Sequential Workflow Execution Engine

**Location:** `lib/executor.ts` — `executeWorkflow()` function

**Purpose:** Traverse all nodes in a workflow graph in dependency order, execute each node, and pass the output of each node as the input to the next.

**Key Steps:**
1. Build an adjacency list from the edge list.
2. Identify the **start node** (a node with no incoming edges).
3. Perform a **topological traversal** (BFS/DFS) from the start node.
4. For each node encountered, invoke the node-specific handler.
5. Store the output of each node in a shared context map keyed by node ID.
6. On completion, return the final node's output as the workflow result.

---

### Algorithm 2 — Loop Node Iteration with Array Data

**Location:** `lib/executor.ts` — `handleLoopNode()` function

**Purpose:** Iterate over an array of items (e.g., rows from an Excel file), executing a sub-workflow for each item, and collecting all results into an output array.

**Key Steps:**
1. Resolve the input array from the execution context.
2. For each element in the array:
   a. Inject the element as the current loop item into the context.
   b. Execute all child nodes connected to the loop body.
   c. Collect the output of the loop body.
3. Return the collected results as an array.

---

### Algorithm 3 — Template Variable Resolution

**Location:** `lib/executor.ts` — `resolveTemplateVariables()` function

**Purpose:** Replace all occurrences of `{{input.key}}` or `{{nodeId.key}}` in a configuration string with the actual runtime value from the execution context.

**Key Steps:**
1. Accept a configuration string and the current context map.
2. Use a regular expression to find all `{{...}}` tokens.
3. For each token, parse the `nodeId` and `key` components.
4. Look up the value from the context map using `nodeId` → `output` → `key`.
5. Replace the token with the resolved value (or an empty string if not found).
6. Return the fully-resolved string.

---

### Algorithm 4 — AI Node Type Dispatch

**Location:** `app/api/ai/execute/route.ts` — `POST` handler

**Purpose:** Route an incoming AI node execution request to the appropriate Gemini API call based on the `aiType` field of the node configuration.

**Key Steps:**
1. Parse the request body for `aiType`, `prompt`, and `inputText`.
2. Initialise the Google Gemini `GenerativeModel` client.
3. Dispatch to the appropriate handler based on `aiType`:
   - `text-generation` → Send prompt directly, return generated text.
   - `analysis` → Prepend analytical instruction to prompt, parse result.
   - `chatbot` → Send with conversation history context.
   - `data-extraction` → Instruct model to return structured JSON.
4. Return the result in a standardised JSON response envelope.
5. Handle API errors with appropriate HTTP status codes.

---

### Algorithm 5 — File Upload Processing and Base64 Encoding

**Location:** `components/NodeConfigPanel.tsx` — `handleFileUpload()` handler

**Purpose:** Convert a user-uploaded file (`.xlsx`, `.csv`, `.pdf`) into a Base64-encoded string so it can be transmitted to a backend API endpoint via a JSON request body.

**Key Steps:**
1. Listen for a file selection event on the file input element.
2. Validate the file type against the accepted MIME types.
3. Create a `FileReader` instance and invoke `readAsDataURL()`.
4. On load completion, extract the Base64 portion of the Data URL (after the comma).
5. Store the Base64 string and the file name in the node's configuration state.
6. Display a confirmation to the user that the file is ready for processing.

---

> **📝 Editorial Note:** Algorithms should also be presented in formal pseudocode notation in the Chapter 4 body. The above summaries provide the description; refer to `04-system-design.md` for the full pseudocode blocks.
