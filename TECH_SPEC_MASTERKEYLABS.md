# Technical Specification & Software Architecture Document (SAD/TS): MasterKeyLabs

**Version:** 1.0  
**Role:** Lead System Architect  
**Project:** MasterKeyLabs
**Date:** April 18, 2026

---

## 1. Architectural Patterns

### 1.1 Layered Clean Architecture
MasterKeyLabs follows a **Modular Layered Architecture** to ensure separation of concerns and testability.

| Layer | Responsibility | Technology |
| :--- | :--- | :--- |
| **Presentation** | UI Rendering & Micro-interactions | Next.js 16, Framer Motion, Tailwind 4.0 |
| **State Management** | Global Client-side State & Persistence | Zustand |
| **Business Logic** | Deterministic Audit Engines & AI Analysis | Pure JS/TS, DeepSeek API |
| **Infrastructure** | Database, Auth, & Storage | Supabase (PostgreSQL, Auth, RLS) |
| **Integration** | External APIs & Agent Orchestration | Google APIs, Resend, Antigravity Agentic Layer |

---

## 2. Data Design

### 2.1 Entity Relationship Definitions
The database schema is designed for multi-tenant isolation using Supabase Row-Level Security (RLS).

#### 2.1.1 Core Entities

| Entity | Attributes | Relationships |
| :--- | :--- | :--- |
| **USERS** | `id (UUID)`, `email`, `role` | Owns one or more **BUSINESSES** |
| **BUSINESSES** | `id (UUID)`, `owner_id (FK)`, `entity_name`, `vertical`, `location` | Parent to all Audit Results |
| **LOSS_AUDIT** | `id (UUID)`, `business_id (FK)`, `monthly_burn`, `metrics (JSON)` | 1:1 with Business per session |
| **NIGHT_LOSS** | `id (UUID)`, `business_id (FK)`, `revenue_leakage`, `lead_count` | 1:1 with Business per session |
| **VISIBILITY** | `id (UUID)`, `business_id (FK)`, `search_score`, `competitor_gap` | 1:1 with Business per session |
| **AI_THREAT** | `id (UUID)`, `business_id (FK)`, `ttl_months`, `risk_level` | 1:1 with Business per session |
| **INTENT_LOGS** | `id (UUID)`, `business_id (FK)`, `intent_type`, `metadata` | 1:N with Business |

### 2.2 Data Flow
1. **Intake**: User submits data via `DashboardIntakeWizard`.
2. **Processing**: `diagnosticStore` triggers deterministic calculations in `lib/audit`.
3. **Persistence**: Results are upserted to Supabase using `useDiagnosticStore` sync logic.
4. **Agentic Layer**: AI Agents monitor `intent_logs` to trigger personalized follow-ups.

---

## 3. Component Breakdown

### 3.1 Auth Module (`src/lib/AuthContext.js`)
- Handles session persistence via `@supabase/ssr`.
- Implements SSO handoff for `futureproof-school.com`.

### 3.2 Audit Engine (`src/lib/audit/`)
- **Module 01 (Waste)**: Deterministic formula based on payroll/overhead benchmarks.
- **Module 02 (Night Loss)**: Time-decay lead calculation.
- **Module 04 (AI Threat)**: Hybrid engine using DeepSeek-v3 for industry-specific risk.

### 3.3 Reporting Module (`src/components/ComprehensiveReportModal.js`)
- Client-side PDF generation using `jspdf` and `html2canvas`.
- Server-side report delivery via `resend`.

---

## 4. Interface & API Contracts

### 4.1 Core TypeScript Interfaces
```typescript
interface IBusinessProfile {
  id: string;
  owner_id: string;
  entity_name: string;
  vertical: 'retail' | 'fb' | 'services' | 'b2b' | 'ecommerce';
  location: string;
  team_scale: string;
}

interface IAuditResult {
  business_id: string;
  monthly_loss: number;
  annual_loss: number;
  breakdown: Record<string, number>;
  source: string;
}

interface IAIThreatAssessment {
  ttl_months: number;
  risk_score: number; // 0-100
  horizon: 'critical' | 'watch' | 'manageable' | 'monitor';
}
```

### 4.2 REST Endpoints (Next.js Routes)
- `POST /api/ai-risk`: Dispatches prompts to DeepSeek.
- `GET /api/google-calendar`: Fetches available review slots.
- `POST /api/export-report`: Triggers PDF generation and email delivery.

---

## 5. Agentic Infrastructure (Antigravity)

### 5.1 Skill & Workflow Interaction
MasterKeyLabs leverages the `.agent/` directory to coordinate AI behavior.

- **Skills**:
    - `audit_validator.js`: Periodically checks `loss_audit_results` for mathematical anomalies.
    - `lead_nurturer.js`: Monitors `intent_logs` and sends automated advice to users via email.
- **Workflows**:
    - `onboarding_flow.yaml`: Coordinates the transition from SSO login to full audit completion.

---

## 6. Security & Encryption

### 6.1 Data Protection Strategy
- **Row-Level Security (RLS)**: Enforced on every table. Users can only access rows where `owner_id === auth.uid()`.
- **Environment Variables**: Managed via Vercel Secret Store. No keys (DeepSeek, Resend) are exposed to the client bundle.
- **PII Encryption**: Sensitive contact data (phone/email) is salted and hashed if stored outside the Auth metadata.
- **Session Security**: JWT tokens are managed via HttpOnly cookies to prevent XSS-based token theft.

---

## 7. Deployment Strategy

### 7.1 Build & CI/CD
1. **Trigger**: Git push to `main` branch.
2. **Linting**: `npm run lint` executes in the Antigravity Terminal.
3. **Validation**: `check_depth_comprehensive.js` ensures logical consistency in audit calculations.
4. **Build**: Next.js Optimized Build (`next build`).
5. **Deployment**: Automatic push to Vercel (Production) or Preview branches.

---

### 8.1 Request-to-Response Execution Logic

1.  **User Submission**: User completes a diagnostic form in the `DashboardIntakeWizard`.
2.  **State Hydration**: The `Zustand` store updates the local diagnostic state and triggers an "Analyzing" UI state.
3.  **Analysis Dispatch**: A secure request is sent to the Edge Function endpoint (`/api/ai-risk`).
4.  **AI Orchestration**: The Edge Function calls the **DeepSeek-v3** API with the industry-specific system prompt.
5.  **Payload Return**: The AI returns a structured JSON assessment (TTL, Risk Level, Advice).
6.  **Data Persistence**: The store performs an `upsert` to **Supabase** via the authenticated client.
7.  **UI Synchronization**: The Dashboard Grid unlocks new components and displays the final Profit Leak Index.

---

## 9. Proposed Project Structure

```text
masterkeylabs/
├── .agent/                # Antigravity Agentic Layer
│   ├── skills/            # Custom AI tool definitions
│   └── workflows/         # Multi-step automation tasks
├── src/
│   ├── app/               # Next.js App Router (Pages & APIs)
│   ├── components/        # UI Components (Atomic Design)
│   ├── lib/               # Business Logic & Contexts
│   │   ├── audit/         # Specialized Audit Engines
│   │   └── supabase/      # Client/Server DB Init
│   ├── store/             # Zustand State Management
│   └── styles/            # Tailwind Global Styles
├── public/                # Static Assets (Logos, Video)
├── SRS_MASTERKEYLABS.md   # Product Requirements
└── TECH_SPEC_MASTERKEYLABS.md # This document
```

---
**Validated against current `package.json` dependencies.**
