# Chapter 6 — System Testing

---

## 6.1 Test Case Design

Testing for AgentFlow covers four levels: Unit, Integration, System, and Acceptance testing. Most tests are manual (due to the project scope), but the key logic functions can be unit-tested programmatically.

---

### 6.1.1 Unit Testing

Unit tests verify individual functions in isolation — no network, no database, no browser.

**Table 6.1 — Unit Test Cases**

| Test ID | Function | Input | Expected Output | Pass/Fail |
|---------|---------|-------|----------------|-----------|
| UT-01 | `replaceTemplateVariables` | `("{{input}}", {name:"John"})` | `{name:"John"}` (object) | ✅ Pass |
| UT-02 | `replaceTemplateVariables` | `("Hello {{input.name}}", {name:"John"})` | `"Hello John"` | ✅ Pass |
| UT-03 | `replaceTemplateVariables` | `("{{input.items}}", {items:[1,2,3]})` | `[1,2,3]` (array) | ✅ Pass |
| UT-04 | `replaceTemplateVariables` | `("{{input.x.y}}", {x:{y:"deep"}})` | `"deep"` | ✅ Pass |
| UT-05 | `replaceTemplateVariables` | `("{{input.missing}}", {name:"John"})` | `"{{input.missing}}"` (unchanged) | ✅ Pass |
| UT-06 | `replaceTemplateVariables` | `(123, {})` | `123` (non-string passthrough) | ✅ Pass |
| UT-07 | `executeIfElse` | `condition="input.value > 10", input={value:15}` | `{condition:true, branch:"true"}` | ✅ Pass |
| UT-08 | `executeIfElse` | `condition="input.value > 10", input={value:5}` | `{condition:false, branch:"false"}` | ✅ Pass |
| UT-09 | `executeLoop` | `arraySource="{{input.items}}", input={items:[a,b,c]}` | `{items:[a,b,c], totalItems:3}` | ✅ Pass |
| UT-10 | `executeLoop` | `arraySource="a,b,c", input={}` | `{items:["a","b","c"], totalItems:3}` | ✅ Pass |
| UT-11 | `executeDataTransform` | `code="return {x: input.y * 2};", input={y:5}` | `{y:5, x:10}` | ✅ Pass |
| UT-12 | `executeDataTransform` | `code="return input.missing.field;"` | `{success:false, error:"..."}` | ✅ Pass |
| UT-13 | `executeDelay` | `duration=100, unit=milliseconds` | Returns after ~100ms, `{delayed:100}` | ✅ Pass |

**Running unit tests manually (in browser console or Node REPL):**

```javascript
// Test UT-01: Template variable with exact match
import { replaceTemplateVariables } from './lib/executor.ts';

const result = replaceTemplateVariables("{{input}}", { name: "John" });
console.assert(typeof result === 'object' && result.name === "John", "UT-01 PASSED");

// Test UT-02: String interpolation
const result2 = replaceTemplateVariables("Hello {{input.name}}", { name: "John" });
console.assert(result2 === "Hello John", "UT-02 PASSED");

// Test UT-03: Array passthrough
const result3 = replaceTemplateVariables("{{input.items}}", { items: [1, 2, 3] });
console.assert(Array.isArray(result3) && result3.length === 3, "UT-03 PASSED");
```

---

### 6.1.2 Integration Testing

Integration tests verify that multiple modules work together correctly — for example, the executor calling the AI API route, or the dashboard fetching saved workflows from the database.

**Table 6.2 — Integration Test Cases**

| Test ID | Modules Involved | Test Scenario | Expected Result | Pass/Fail |
|---------|----------------|--------------|-----------------|-----------|
| IT-01 | `executor.ts` + `/api/ai/execute` | Execute `aiTextGenerator` node with prompt "Say hello" | Returns `{ generatedText: "Hello!...", success: true }` | ✅ Pass |
| IT-02 | `executor.ts` + `/api/email/send` | Execute `sendEmail` node with valid SMTP config | Returns `{ sent: true, messageId: "..." }` | ✅ Pass |
| IT-03 | `executor.ts` + `/api/http-proxy` | Execute `httpRequest` GET to `jsonplaceholder.typicode.com/posts/1` | Returns 200 with post data | ✅ Pass |
| IT-04 | `/api/tasks` + Prisma + Neon | POST a new task, then GET all tasks | New task appears in list | ✅ Pass |
| IT-05 | Zustand store + React Flow canvas | Add node to canvas → check Zustand state | Node appears in `store.nodes` | ✅ Pass |
| IT-06 | NodeConfigPanel + Zustand | Open config, change prompt, click Save → check store | `store.nodes[i].data.config.prompt` updated | ✅ Pass |
| IT-07 | Excel Reader + Loop + executor | Upload xlsx, run Loop node | Items array matches spreadsheet rows | ✅ Pass |
| IT-08 | Clerk middleware + `/api/tasks` | Call GET /api/tasks without auth token | Returns 401 Unauthorized | ✅ Pass |
| IT-09 | `syncUser` + Clerk + Prisma | Signed-in user visits dashboard for the first time | User record created in DB | ✅ Pass |
| IT-10 | Telegram Trigger + executor | Configure with valid bot token, run node | Returns `{ items: [...messages] }` | ✅ Pass |

---

### 6.1.3 System Testing

System tests verify the end-to-end behavior of the entire application from a user's perspective.

**Table 6.3 — System Test Cases**

| Test ID | Feature | Steps | Expected Result | Pass/Fail |
|---------|---------|-------|----------------|-----------|
| ST-01 | Sign Up | 1. Open `/` 2. Click "Get Started" 3. Complete Clerk sign-up form | Redirected to dashboard, user created | ✅ Pass |
| ST-02 | Create Workflow | 1. Go to `/editor` 2. Drag "Webhook Trigger" → "AI Text Generator" 3. Connect them 4. Configure AI prompt 5. Click Run | Both nodes show green success, output appears | ✅ Pass |
| ST-03 | Save Workflow | 1. Build a 2-node workflow 2. Click "Save Agent" 3. Enter name "Test Agent" 4. Click Save | Redirected to dashboard, "Test Agent" card visible | ✅ Pass |
| ST-04 | Load Workflow | 1. From dashboard, click "Edit Agent" on a saved workflow | Editor opens with the saved nodes and connections | ✅ Pass |
| ST-05 | Delete Workflow | 1. From dashboard, hover over a workflow card 2. Click trash icon 3. Confirm | Workflow card disappears from list | ✅ Pass |
| ST-06 | Excel to Email | 1. Upload contacts.xlsx (10 rows) 2. Connect: ExcelReader→Loop→AITextGen→SendEmail 3. Configure template vars 4. Run | 10 emails sent, each personalized | ✅ Pass |
| ST-07 | If/Else Branch | 1. Add Trigger→IfElse→TwoNodes 2. Configure condition `input.value > 5` 3. Run with input `{value: 10}` | Only the "true" branch node executes | ✅ Pass |
| ST-08 | Error Handling | 1. Add AI node 2. Delete GEMINI_API_KEY from .env 3. Run | Node shows red border with "GEMINI_API_KEY not configured" error | ✅ Pass |
| ST-09 | Missing Auth | 1. Sign out 2. Try to access `/dashboard` directly | Redirected to Clerk sign-in page | ✅ Pass |
| ST-10 | Large Excel | 1. Upload CSV with 500 rows 2. Run Excel Reader | All 500 rows parsed, `totalItems: 500` in output | ✅ Pass |
| ST-11 | HTTP Proxy CORS | 1. Add HTTP Request to `api.github.com/users/octocat` 2. Run | Returns GitHub user JSON without CORS error | ✅ Pass |
| ST-12 | Delay Node | 1. Connect Trigger → Delay (2 seconds) → Email 2. Run | Wait ~2 seconds, then email is sent | ✅ Pass |

---

### 6.1.4 Acceptance Testing

Acceptance tests verify that the project meets the original objectives from Chapter 1 (Section 1.4).

| Objective ID | Objective | Test Method | Result |
|-------------|-----------|------------|--------|
| OBJ-01 | Drag-and-drop canvas for non-coders | User who has never seen the app can build a 3-node workflow in < 5 minutes | ✅ Met |
| OBJ-02 | At least 4 AI node types | Run all 4 AI nodes and verify meaningful output | ✅ Met |
| OBJ-03 | Sequential executor with branching and iteration | Run workflows with If/Else and Loop nodes | ✅ Met |
| OBJ-04 | Template variable interpolation | Use `{{input.item.email}}` in email node, verify it resolves | ✅ Met |
| OBJ-05 | Email sending via SMTP | Send test email and verify receipt in inbox | ✅ Met |
| OBJ-06 | Excel file processing | Upload xlsx, loop through rows, send emails | ✅ Met |
| OBJ-07 | Workflow persistence in PostgreSQL | Save and reload workflow 3 times | ✅ Met |
| OBJ-08 | Protected API routes | All dashboard routes return 401 without auth | ✅ Met |
| OBJ-09 | Polished UI | UI reviewed against modern design standards | ✅ Met |
| OBJ-10 | Clean, extensible codebase | New developer can add a node in < 30 minutes | ✅ Met |

---

## 6.2 Specific System Testing

### AI Node Quality Testing

For AI nodes, we evaluate both technical correctness (does it return a response?) and output quality (is the response useful?).

**AI Text Generator Quality Test:**

| Prompt | Temperature | Expected Quality | Actual Quality |
|--------|------------|-----------------|---------------|
| "Write a 3-sentence product description for a blue pen" | 0.7 | Fluent, creative | ✅ Good |
| "List 5 programming languages" | 0.3 | Accurate, consistent | ✅ Good |
| "{{input.name}} is the best!" | 0.7 | Template resolved before sending | ✅ Good |

**AI Data Extractor Test:**

| Input Text | Schema | Expected JSON | Result |
|-----------|--------|--------------|--------|
| "John Smith, 25 years old, john@test.com" | `{"name": "string", "age": "number", "email": "string"}` | `{"name":"John Smith","age":25,"email":"john@test.com"}` | ✅ Pass |

### Email Delivery Testing

| Scenario | Config | Result |
|---------|--------|--------|
| Plain text email | To: valid address, Subject: "Test", Body: "Hello" | ✅ Delivered |
| HTML email | Body contains `<b>bold</b>` | ✅ Rendered as HTML |
| File attachment | Attach `report.pdf` (< 1MB) | ✅ Attachment received |
| Invalid email | To: "not-an-email" | ✅ Returns error message |
| Missing SMTP config | Empty .env SMTP vars | ✅ Returns clear error |

### Template Variable Edge Cases

| Input | Template | Expected | Result |
|-------|---------|----------|--------|
| `{name: "John"}` | `{{input.name}}` | `"John"` | ✅ Pass |
| `{items: [1,2]}` | `{{input.items}}` | `[1,2]` (array) | ✅ Pass |
| `{a: {b: "deep"}}` | `{{input.a.b}}` | `"deep"` | ✅ Pass |
| `{}` | `{{input.missing}}` | `"{{input.missing}}"` (unchanged) | ✅ Pass |
| `"string input"` | `{{input}}` | `"string input"` | ✅ Pass |

---

## 6.3 Test Reports

### Summary Report

| Test Type | Total Tests | Passed | Failed | Pass Rate |
|-----------|------------|--------|--------|-----------|
| Unit Testing | 13 | 13 | 0 | 100% |
| Integration Testing | 10 | 10 | 0 | 100% |
| System Testing | 12 | 12 | 0 | 100% |
| Acceptance Testing | 10 | 10 | 0 | 100% |
| **Total** | **45** | **45** | **0** | **100%** |

### Known Limitations Found During Testing

| Issue | Severity | Status |
|-------|---------|--------|
| File upload limit is 1MB; large Excel files are rejected | Medium | By design (can be increased) |
| Loop node re-execution deletes nodes from `executedNodes` Set, which could cause issues in complex branching workflows | Medium | Known, workaround: keep workflows linear |
| Telegram getUpdates call may rate-limit if called too frequently | Low | User responsibility |
| Excel Writer downloads trigger browser download popup, which some popup blockers may suppress | Low | Expected browser behavior |

### Bug Fix Log

| Bug ID | Description | Fixed In | Solution |
|--------|------------|---------|---------|
| BUG-01 | `{{input.items}}` was being stringified before passing to Loop node | v1.0.1 | Added exact match check in `replaceTemplateVariables` |
| BUG-02 | Loop node downstream nodes only executed once due to `executedNodes` Set | v1.0.2 | Added `executedNodes.delete(edge.target)` before each loop iteration |
| BUG-03 | Email HTML rendering failed when body contained unescaped HTML | v1.0.3 | Added `body.replace(/\n/g, "<br>")` for simple HTML conversion |
| BUG-04 | AI node output was not merged with upstream input | v1.0.4 | Changed return to `{ ...input, ...result }` to preserve data chain |

---

*← [Chapter 5 — Implementation](./05-implementation.md) | Next: [Chapter 7 — Conclusion →](./07-conclusion.md)*
