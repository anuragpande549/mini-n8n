# Abstract

---

**Project Title:** AgentFlow: A Visual AI Workflow Automation Platform

**Students:** [Student Name 1], [Student Name 2], [Student Name 3], [Student Name 4]

**Guide:** [Guide Name], [Designation], Department of [Department Name]

**Institution:** [College Name], [University Name]

**Academic Year:** [Academic Year]

---

## Abstract

The proliferation of cloud APIs, artificial intelligence services, and microservice-based architectures has created a significant demand for flexible, user-friendly workflow automation tools. Existing commercial platforms such as Zapier and Make (formerly Integromat) offer visual workflow builders but are often cost-prohibitive, closed-source, and limited in their support for custom AI-powered processing pipelines. Open-source alternatives such as n8n, while powerful, impose a steep technical learning curve that excludes non-developer users.

**AgentFlow** is a self-hosted, open-source visual workflow automation platform developed as a final-year engineering project. It is designed to address the growing need for accessible, AI-augmented automation by enabling users to construct, configure, and execute complex multi-step workflows through an intuitive drag-and-drop graphical interface — without writing any code.

The platform is built upon a modern, production-grade technology stack: **Next.js 16** (App Router) provides the full-stack web framework; **React Flow 11** renders the interactive workflow canvas; **Google Gemini (`gemini-2.5-flash-lite`)** powers all artificial intelligence capabilities; **Prisma 7** with **PostgreSQL (Neon)** manages persistent storage; **Clerk** handles user authentication and session management; and **Zustand 5** manages global client-side state. The system supports **14 distinct node types** grouped into four categories — Trigger, AI, Action, and Logic — enabling a wide variety of automation scenarios.

Key features of AgentFlow include: a sequential workflow execution engine with support for branching (If/Else) and iteration (Loop); a template variable system allowing dynamic data interpolation between nodes using `{{input.fieldName}}` syntax; four AI node types backed by the Gemini API (text generation, sentiment/contextual analysis, chatbot conversation, and structured data extraction); email delivery via Nodemailer SMTP with dynamic personalisation; Excel and CSV file processing using SheetJS; Telegram message fetching; and HTTP request proxying. All user workflows are persisted in a cloud PostgreSQL database and are accessible through a personal dashboard.

System analysis was conducted using Data Flow Diagrams (DFDs), Use Case Diagrams, and Sequence Diagrams to model information flow and actor interactions. The system was designed using an Entity-Relationship Diagram (ER Diagram), a Component Diagram, and a layered architectural model. The development followed an Agile methodology with four iterative sprints, enabling incremental delivery and continuous evaluation against functional requirements.

Comprehensive testing was performed at the unit, integration, system, and acceptance levels. All critical functional requirements were verified, including accurate AI output generation, correct email delivery, reliable file parsing, and consistent database persistence. The platform was tested across major modern browsers and demonstrated acceptable performance characteristics within the intended usage context.

The project successfully demonstrates the feasibility of building a feature-complete, production-quality workflow automation platform as an academic project, and contributes a reusable, extensible codebase to the open-source community. Future enhancements identified for subsequent versions include scheduled (cron-based) workflow execution, real-time collaborative editing, webhook receivers, and expanded integrations with third-party services such as Slack, Google Sheets, and WhatsApp Business.

---

**Keywords:** Workflow Automation, Visual Programming, Large Language Models, Google Gemini, Next.js, React Flow, Prisma, AI Integration, No-Code Platform, Node-Based Interface, Drag-and-Drop, PostgreSQL, Clerk Authentication

---

> **📝 Editorial Note:** The abstract should be a single self-contained page (typically 250–400 words). The version above is approximately 420 words; trim if your institution has a strict limit. Do not include citations or footnotes in the abstract.
