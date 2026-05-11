# Chapter 1 — Introduction

---

## List of Figures

| Figure No. | Title | Chapter |
|-----------|-------|---------|
| Fig 1.1 | AgentFlow Landing Page | 1 |
| Fig 1.2 | Workflow Editor Canvas Overview | 1 |
| Fig 1.3 | Node Sidebar and Categories | 1 |
| Fig 3.1 | Data Flow Diagram (Level 0) | 3 |
| Fig 3.2 | Data Flow Diagram (Level 1) | 3 |
| Fig 3.3 | Use Case Diagram | 3 |
| Fig 3.4 | Sequence Diagram — Workflow Execution | 3 |
| Fig 4.1 | System Architecture Diagram | 4 |
| Fig 4.2 | ER Diagram | 4 |
| Fig 4.3 | Component (Class) Diagram | 4 |
| Fig 5.1 | Dashboard — Saved Workflows | 5 |
| Fig 5.2 | Editor with Nodes Connected | 5 |
| Fig 5.3 | Node Config Panel Open | 5 |

---

## List of Tables

| Table No. | Title | Chapter |
|-----------|-------|---------|
| Table 2.1 | Work Breakdown Structure | 2 |
| Table 2.2 | Hardware Requirements | 2 |
| Table 2.3 | Software Requirements | 2 |
| Table 2.4 | Team Roles and Responsibilities | 2 |
| Table 3.1 | Functional Requirements | 3 |
| Table 3.2 | Non-Functional Requirements | 3 |
| Table 3.3 | Database Schema — User Table | 3 |
| Table 3.4 | Database Schema — AgentTask Table | 3 |
| Table 5.1 | API Endpoint Reference | 5 |
| Table 5.2 | Node Type Reference | 5 |
| Table 6.1 | Unit Test Cases | 6 |
| Table 6.2 | Integration Test Cases | 6 |
| Table 6.3 | System Test Cases | 6 |

---

## List of Algorithms

| Algo No. | Name | Chapter |
|---------|------|---------|
| Algorithm 1 | Workflow Execution (Sequential Chain) | 4 |
| Algorithm 2 | Loop Node Iteration | 4 |
| Algorithm 3 | Template Variable Resolution | 4 |
| Algorithm 4 | AI Node Dispatch | 4 |
| Algorithm 5 | File Upload to Base64 | 5 |

---

## 1.1 Background

Automation is not a new idea. Factories automated their assembly lines decades ago, and computers automated data processing not long after. But automating *software* workflows — connecting APIs, processing data, sending notifications, and running AI models — has traditionally been a task reserved for experienced developers who can write code fluently.

Tools like **Zapier**, **Make (formerly Integromat)**, and **n8n** have tried to change this. They let non-technical users build automation pipelines visually by dragging and dropping components. But these tools often come with trade-offs: they are expensive, hosted on third-party servers, or they hide too much of the underlying logic to be truly flexible.

At the same time, the explosion of **Large Language Models (LLMs)** — especially Google's Gemini, OpenAI's GPT-4, and Meta's LLaMA — has created a brand-new category of automation node: the **AI node**. Suddenly, instead of just connecting HTTP APIs, users want to generate emails with AI, analyze customer sentiment, extract structured data from raw text, and have chatbot conversations — all inside the same pipeline.

This is the gap that **AgentFlow** was built to fill.

AgentFlow is a self-hosted, open-source visual workflow automation platform with **first-class AI support**. It is built on top of modern, production-grade web technologies: Next.js 16 as the full-stack framework, React Flow for the visual canvas, Google Gemini for AI capabilities, Prisma + PostgreSQL for data persistence, and Clerk for authentication. The result is a platform that feels as polished as any SaaS product but runs entirely on infrastructure you control.

---

## 1.2 Purpose of the Project

The core purpose of AgentFlow is simple: **make it possible for anyone — developer or not — to build powerful, AI-powered automation workflows through a visual drag-and-drop interface.**

More specifically, the project was created to:

1. **Demonstrate a practical full-stack application** using the Next.js App Router, TypeScript, and modern React patterns.
2. **Show how to integrate Google Gemini** into a real product, not just a toy script, including text generation, sentiment analysis, keyword extraction, chatbot conversations, and structured data extraction.
3. **Solve real automation problems** like sending bulk emails from a spreadsheet, fetching Telegram messages and processing them, calling external APIs and transforming the response, and applying conditional logic in a visual pipeline.
4. **Provide a learning resource** for college students who want to understand how a production-grade web application is structured, how authentication works with Clerk, how databases are managed with Prisma, and how Node.js backend logic is exposed through Next.js API routes.

---

## 1.3 Project Scope

The scope of AgentFlow version 1.0 covers the following:

### What IS included:
- **Visual workflow editor** with drag-and-drop nodes using React Flow.
- **14 node types** across four categories: Trigger, AI, Action, and Logic.
- **Google Gemini AI integration** for text generation, analysis, chatbot, and data extraction.
- **Email sending** via SMTP (Nodemailer) with support for attachments and file uploads.
- **Excel/CSV file processing** — read from spreadsheets, loop through rows, and write results back to Excel.
- **Telegram integration** — fetch messages from a bot as a workflow trigger.
- **HTTP Request node** to call any external REST API.
- **Data Transform node** to run custom JavaScript code on workflow data.
- **If/Else, Delay, and Loop logic nodes**.
- **Template variables** like `{{input.fieldName}}` to pass data between nodes.
- **User authentication** with Clerk (sign up, sign in, sign out).
- **Cloud persistence** — saved workflows stored in PostgreSQL via Neon and Prisma.
- **Dashboard** to manage (view, edit, delete) saved workflow agents.
- **Responsive dark/light mode UI**.

### What is NOT included in v1.0:
- Real-time collaboration (multiple users editing the same workflow simultaneously).
- Scheduled workflow execution (cron jobs running in the background automatically).
- Webhook receivers (actually receiving incoming HTTP requests from the internet).
- Workflow version history or rollback.
- Role-based access control (different user permission levels).
- Mobile app or native desktop client.

These features are considered for future versions and are described in Chapter 7.

---

## 1.4 Project Objectives

The project has the following measurable objectives, which are verified in the testing chapter:

1. **Build a drag-and-drop canvas** where users can add, connect, configure, and delete workflow nodes without writing code.

2. **Implement at least 4 AI node types** backed by Google Gemini, each producing meaningful, contextual output based on the user's prompt and input data.

3. **Implement a sequential workflow executor** that traverses connected nodes in order, passes output from one node as input to the next, and supports branching (If/Else) and iteration (Loop).

4. **Support template variable interpolation** — any node configuration field should be able to reference the output of a previous node using `{{input.fieldName}}` syntax.

5. **Integrate email sending** using Nodemailer with SMTP, supporting dynamic `To`, `Subject`, and `Body` fields, plus file attachments.

6. **Integrate Excel file processing** — read rows from an uploaded `.xlsx` or `.csv` file and make them available as an array for downstream nodes.

7. **Persist workflows** in a PostgreSQL database so users can save, reload, and manage their workflow agents.

8. **Secure all dashboard and data endpoints** using Clerk authentication, while keeping the landing page and AI execution endpoint publicly accessible.

9. **Deliver a polished, professional UI** that works on modern desktop browsers.

10. **Structure the codebase** in a way that is easy for a new developer to understand and extend.

---

*← Back to [docs/README.md](./README.md) | Next: [Chapter 2 — Project Planning →](./02-project-planning.md)*
