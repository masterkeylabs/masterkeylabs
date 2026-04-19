# MasterKeyLabs — Mobile Application Architecture Blueprint
## Senior System Architect Specification · v2.0

**Classification:** Internal — Technical Leadership  
**Author:** Senior System Architect  
**Date:** April 19, 2026  
**Supersedes:** v1.0 (preliminary sketch)

---

## Executive Summary

This document is the definitive architectural blueprint for bringing MasterKeyLabs to iOS and Android as a **native mobile application**. It is grounded in a forensic analysis of the existing production codebase — not abstract theory — and provides a precise migration path that preserves every business rule, calculation engine, and design token already shipping on the web platform.

The architecture is designed around one principle: **maximize code reuse without compromising native experience.**

---

## 1. Current System Audit (What We Are Working With)

Before proposing architecture, we must understand exactly what exists.

### 1.1 Existing Web Stack

| Layer | Technology | Version | Mobile Compatibility |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 | ❌ Server Components incompatible |
| UI Library | React | 19.2.3 | ✅ Core reconciler shared with RN |
| Animation | Framer Motion | 12.34.0 | ❌ DOM-only, needs Reanimated replacement |
| State | Zustand | 5.0.11 | ✅ Platform-agnostic, direct reuse |
| Styling | Tailwind CSS | 4.0 | ⚠️ Needs NativeWind adapter |
| Auth/DB | Supabase SSR + JS | 0.8.0 / 2.48.1 | ⚠️ SSR client incompatible; JS client works |
| Icons | Lucide React | 0.564.0 | ✅ Has `lucide-react-native` counterpart |
| PDF | jsPDF + html2canvas | Latest | ❌ DOM-dependent, needs native alternative |
| Charts | Recharts | 3.7.0 | ❌ SVG/DOM, needs Victory Native or Skia |
| Email | Resend | 6.9.3 | ✅ Server-side only, unchanged |

### 1.2 Portable Business Logic (Zero-Rewrite Required)

These modules contain **pure JavaScript** with no DOM or Next.js dependencies. They can be imported directly into React Native without modification:

| Module | Path | Lines | Purpose |
|---|---|---|---|
| Operational Engine | `src/lib/audit/engines/operational.js` | 109 | Loss audit calculations with Logic Guards |
| Night Loss Engine | `src/lib/audit/engines/night-loss.js` | ~80 | After-hours revenue decay modeling |
| Visibility Engine | `src/lib/audit/engines/visibility.js` | ~120 | Search gap analysis & signal scoring |
| AI Threat Engine | `src/lib/audit/engines/ai-threat.js` | ~90 | Extinction horizon computation |
| Audit Config | `src/lib/audit/config.js` | 60 | Baseline waste rates, thresholds |
| Audit Parsers | `src/lib/audit/parsers.js` | 78 | Input normalization |
| Audit Formatters | `src/lib/audit/formatters.js` | 30 | Currency/number formatting |
| Calculations | `src/lib/calculations.js` | 55 | Shared math utilities |
| Diagnostic Store | `src/store/diagnosticStore.js` | 68 | Zustand state (fully portable) |
| Translations | `src/lib/translations.js` | 2432 | Full EN/HI i18n dictionary |
| Country Data | `src/lib/countries.js` | ~150 | Geo-reference data |

> [!IMPORTANT]
> **This is the critical insight**: ~3,000 lines of battle-tested business logic, state management, and localization are **immediately portable** to mobile with zero changes. This represents approximately 40% of the total application intelligence.

### 1.3 Components Requiring Mobile Reimplementation

| Web Component | Lines | Why Rewrite | Mobile Replacement |
|---|---|---|---|
| `DashboardIntakeWizard.js` | 1,800 | DOM forms, CSS animations | Native form wizard with Reanimated |
| `DashboardGrid.js` | 400 | CSS Grid layout | FlashList + native cards |
| `ComprehensiveReportModal.js` | 900 | html2canvas, DOM-to-PDF | `expo-print` + native Share sheet |
| `AIExtinctionTimer.js` | 1,400 | Canvas-based timer, DOM sharing | Skia canvas + `expo-sharing` |
| `Header.js` / `Sidebar.js` | 600 | Desktop nav paradigm | Bottom tabs + drawer |
| `ServiceList.js` | 170 | Horizontal scroll CSS | Native FlatList with snap |
| `HomeClient.js` | 600 | Scroll-based hero section | Native parallax scroll |

---

## 2. Recommended Architecture: Expo + React Native (Monorepo)

### 2.1 Why This Stack

| Alternative Considered | Verdict | Reason |
|---|---|---|
| **Flutter** | ❌ Rejected | Requires full Dart rewrite. Zero code reuse with existing React/JS codebase. |
| **PWA (Progressive Web App)** | ❌ Rejected | No push notifications on iOS, no App Store presence, limited native APIs. |
| **Capacitor/Ionic** | ⚠️ Insufficient | WebView wrapper — does not deliver native performance for heavy chart rendering and haptics. |
| **React Native CLI (bare)** | ⚠️ Over-engineered | Requires manual native module linking, Xcode/Gradle management. Unnecessary complexity. |
| **Expo (Managed → Dev Build)** | ✅ **Selected** | Maximum code reuse with existing React ecosystem. Native rendering. EAS handles builds. File-based routing mirrors Next.js patterns. |

### 2.2 Monorepo Structure (Turborepo)

```
masterkeylabs/
├── apps/
│   ├── web/                          ← Current Next.js app (unchanged)
│   │   ├── src/
│   │   │   ├── app/                  ← Next.js App Router pages
│   │   │   ├── components/           ← Web-specific UI components
│   │   │   └── lib/                  ← SYMLINK → packages/shared
│   │   └── package.json
│   │
│   └── mobile/                       ← NEW: Expo React Native app
│       ├── app/                      ← Expo Router (file-based routing)
│       │   ├── (tabs)/               ← Tab navigator group
│       │   │   ├── index.tsx         ← Home / AI Timer
│       │   │   ├── dashboard.tsx     ← Command Center
│       │   │   ├── services.tsx      ← Protocol Catalog
│       │   │   └── profile.tsx       ← Business Profile
│       │   ├── dashboard/
│       │   │   ├── loss-audit.tsx
│       │   │   ├── night-loss.tsx
│       │   │   ├── visibility.tsx
│       │   │   └── ai-threat.tsx
│       │   ├── services/
│       │   │   └── [id].tsx          ← Dynamic service detail
│       │   ├── auth/
│       │   │   ├── login.tsx
│       │   │   └── signup.tsx
│       │   └── _layout.tsx           ← Root layout + providers
│       ├── components/               ← Mobile-specific UI
│       │   ├── cards/
│       │   ├── charts/
│       │   ├── wizards/
│       │   └── shared/
│       ├── hooks/                    ← Mobile-specific hooks
│       ├── constants/
│       ├── app.json                  ← Expo config
│       ├── eas.json                  ← EAS Build config
│       └── package.json
│
├── packages/
│   └── shared/                       ← EXTRACTED: Platform-agnostic logic
│       ├── audit/
│       │   ├── engines/
│       │   │   ├── operational.js    ← Moved from web src/lib/audit/
│       │   │   ├── night-loss.js
│       │   │   ├── visibility.js
│       │   │   └── ai-threat.js
│       │   ├── config.js
│       │   ├── parsers.js
│       │   └── formatters.js
│       ├── store/
│       │   └── diagnosticStore.js    ← Moved from web src/store/
│       ├── i18n/
│       │   └── translations.js       ← Moved from web src/lib/
│       ├── geo/
│       │   └── countries.js
│       ├── calculations.js
│       └── package.json
│
├── turbo.json                        ← Turborepo pipeline config
├── package.json                      ← Root workspace config
└── pnpm-workspace.yaml               ← Workspace definition
```

> [!TIP]
> **The `packages/shared` module is the architectural keystone.** Both the web and mobile apps import from the same source of truth. A bug fix in the operational engine is automatically available on both platforms.

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                               │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │    WEB (Next.js)    │    │   MOBILE (Expo/RN)       │    │
│  │                     │    │                          │    │
│  │  ┌───────────────┐  │    │  ┌────────────────────┐  │    │
│  │  │ React 19 DOM  │  │    │  │ React Native Core  │  │    │
│  │  │ Framer Motion │  │    │  │ Reanimated 3       │  │    │
│  │  │ Tailwind CSS  │  │    │  │ NativeWind v4      │  │    │
│  │  │ Recharts      │  │    │  │ Victory Native     │  │    │
│  │  │ html2canvas   │  │    │  │ expo-print         │  │    │
│  │  └───────┬───────┘  │    │  └─────────┬──────────┘  │    │
│  │          │           │    │            │             │    │
│  └──────────┼───────────┘    └────────────┼─────────────┘    │
│             │                             │                  │
│             └──────────┬──────────────────┘                  │
│                        │                                     │
│              ┌─────────▼─────────┐                           │
│              │  packages/shared  │                           │
│              │                   │                           │
│              │ • Audit Engines   │                           │
│              │ • Zustand Store   │                           │
│              │ • Translations    │                           │
│              │ • Calculations    │                           │
│              │ • Geo Data        │                           │
│              └─────────┬─────────┘                           │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTPS / WSS (TLS 1.3)
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                    BACKEND TIER                               │
│                        │                                     │
│              ┌─────────▼─────────┐                           │
│              │     Supabase      │                           │
│              │                   │                           │
│              │ ┌───────────────┐ │                           │
│              │ │ Auth (GoTrue) │ │  ← Google/Apple/OTP       │
│              │ ├───────────────┤ │                           │
│              │ │  PostgreSQL   │ │  ← RLS-enforced tables    │
│              │ │  + Realtime   │ │  ← CDC for live dashboard │
│              │ ├───────────────┤ │                           │
│              │ │ Edge Functions│ │  ← AI Risk API, Calendar  │
│              │ ├───────────────┤ │                           │
│              │ │   Storage     │ │  ← Report PDFs, Assets    │
│              │ └───────────────┘ │                           │
│              └───────────────────┘                           │
│                                                              │
│              ┌───────────────────┐                           │
│              │  External APIs    │                           │
│              │  • Resend (Email) │                           │
│              │  • Google Cal API │                           │
│              │  • DeepSeek (LLM) │                           │
│              └───────────────────┘                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Mobile Technology Stack (Detailed)

### 4.1 Core Framework

| Concern | Library | Version | Purpose |
|---|---|---|---|
| Runtime | React Native | 0.79+ | Native rendering engine |
| Platform | Expo SDK | 53 | Managed native modules |
| Routing | Expo Router | v4 | File-based navigation (mirrors Next.js) |
| Build | EAS Build | Latest | Cloud builds for iOS/Android |
| Updates | EAS Update | Latest | OTA updates without app store review |

### 4.2 UI & Animation

| Concern | Library | Replaces (Web) |
|---|---|---|
| Styling | NativeWind v4 | Tailwind CSS 4.0 |
| Animation | React Native Reanimated 3 | Framer Motion |
| Gestures | React Native Gesture Handler | Mouse events |
| Charts | Victory Native (Skia) | Recharts |
| Icons | Lucide React Native | Lucide React |
| Blur/Glass | `expo-blur` | CSS `backdrop-filter` |
| Linear Gradient | `expo-linear-gradient` | CSS `linear-gradient` |
| Canvas | `@shopify/react-native-skia` | HTML Canvas |

### 4.3 Data & State

| Concern | Library | Notes |
|---|---|---|
| State | Zustand 5.x | **Direct import from `packages/shared`** |
| Persistence | `zustand/middleware` (persist) | AsyncStorage adapter for offline |
| Server State | TanStack Query v5 | Caching, background refetch, offline queue |
| Auth | `@supabase/supabase-js` | Standard JS client (NOT SSR) |
| Secure Storage | `expo-secure-store` | Encrypted token storage (Keychain/Keystore) |

### 4.4 Native Capabilities

| Capability | Library | Use Case |
|---|---|---|
| Push Notifications | `expo-notifications` | AI Threat alerts, weekly P&L summaries |
| Biometrics | `expo-local-authentication` | FaceID / Fingerprint lock |
| Haptics | `expo-haptics` | Feedback on scan completion, money leak detection |
| Share | `expo-sharing` | Export reports to WhatsApp, email |
| Print/PDF | `expo-print` | Native PDF generation (replaces html2canvas) |
| Camera | `expo-camera` | Future: Document scanning for invoices |
| Deep Linking | Expo Router built-in | `masterkeylabs://dashboard` |

---

## 5. Authentication Architecture (Mobile-Specific)

The web app uses `@supabase/ssr` with cookie-based auth. Mobile cannot use cookies. We need a different transport.

```
┌──────────────────────────────────────────────────────┐
│                  MOBILE AUTH FLOW                      │
│                                                        │
│  1. User taps "Sign in with Google"                   │
│     │                                                  │
│     ▼                                                  │
│  2. expo-auth-session opens system browser             │
│     (NOT WebView — required by Google/Apple policy)    │
│     │                                                  │
│     ▼                                                  │
│  3. Supabase GoTrue handles OAuth redirect             │
│     Returns: { access_token, refresh_token }           │
│     │                                                  │
│     ▼                                                  │
│  4. Tokens stored in expo-secure-store                  │
│     (Keychain on iOS, EncryptedSharedPreferences       │
│      on Android)                                       │
│     │                                                  │
│     ▼                                                  │
│  5. Supabase JS client initialized with stored tokens  │
│     supabase.auth.setSession({ access_token, ... })    │
│     │                                                  │
│     ▼                                                  │
│  6. All subsequent API calls include Bearer token      │
│     RLS policies enforce tenant isolation identically   │
│                                                        │
└──────────────────────────────────────────────────────┘
```

> [!WARNING]
> **Apple Sign-In is MANDATORY** for any iOS app that offers third-party social login. This is an App Store Review requirement. We must add Apple as a Supabase Auth provider alongside Google.

---

## 6. Navigation Architecture

```
┌──────────────────────────────────────────┐
│              ROOT LAYOUT                  │
│  (AuthProvider + ThemeProvider +          │
│   LanguageProvider + QueryClient)         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         TAB NAVIGATOR             │  │
│  │                                    │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐ │  │
│  │  │ Home │ │Dash- │ │Serv- │ │  │ │  │
│  │  │  /   │ │board │ │ices  │ │  │ │  │
│  │  │Timer │ │      │ │      │ │👤│ │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └┬─┘ │  │
│  │     │        │        │      │    │  │
│  └─────┼────────┼────────┼──────┼────┘  │
│        │        │        │      │       │
│        ▼        ▼        ▼      ▼       │
│    AI Timer  Dashboard  List   Profile  │
│              │                          │
│              ├─→ Loss Audit (Stack)     │
│              ├─→ Night Loss (Stack)     │
│              ├─→ Visibility (Stack)     │
│              ├─→ AI Threat (Stack)      │
│              └─→ Export Report (Modal)  │
│                                         │
│  Services ─→ [id] Detail (Stack)        │
│                                         │
│  Auth Flow (Modal Stack)                │
│  ├─→ Login                             │
│  └─→ Signup                            │
│                                         │
└──────────────────────────────────────────┘
```

---

## 7. Data Flow & Offline Strategy

### 7.1 Online Mode (Primary)

```
User Input → Zustand Store → Audit Engine (local calc) → UI Update
                    │
                    └──→ TanStack Mutation → Supabase RPC/Insert
                              │
                              └──→ onSuccess: invalidate queries
```

### 7.2 Offline Mode (Resilient)

```
User Input → Zustand Store (persisted to AsyncStorage)
                    │
                    └──→ TanStack Mutation (paused — no network)
                              │
                              └──→ Queued in mutation cache
                                        │
                              [Network restored]
                                        │
                              └──→ Auto-retry → Supabase sync
```

> [!TIP]
> All four diagnostic engines run **entirely client-side** with pure JavaScript. Users can complete the full audit sequence offline. Only the final "Save & Sync" step requires connectivity.

---

## 8. Platform-Specific Considerations

### 8.1 iOS Requirements

| Requirement | Solution |
|---|---|
| Apple Sign-In mandatory | Add to Supabase Auth providers |
| App Tracking Transparency | Declare in `app.json` — we do NOT track, simple ATT prompt |
| Minimum deployment target | iOS 15.0 (covers 98% of active devices) |
| Push notification entitlement | Configure via EAS + Apple Developer Portal |
| App Store screenshot sizes | 6.7", 6.5", 5.5" iPhone + iPad Pro |

### 8.2 Android Requirements

| Requirement | Solution |
|---|---|
| Target SDK | API 35 (Android 15) |
| Min SDK | API 24 (Android 7.0 — covers 95%+) |
| Google Play Data Safety | Declare Supabase data collection accurately |
| Adaptive icons | Provide `ic_launcher_foreground.xml` |
| 64-bit APK | Default with Expo/Hermes engine |

---

## 9. Build & Deployment Pipeline

```
┌───────────────────────────────────────────────────────┐
│                   EAS PIPELINE                         │
│                                                        │
│  Developer pushes to `main` branch                     │
│       │                                                │
│       ▼                                                │
│  ┌─────────────┐                                      │
│  │ EAS Build   │ ← Cloud-based (no local Xcode needed)│
│  │             │                                      │
│  │  iOS:  .ipa │                                      │
│  │  AND: .aab  │                                      │
│  └──────┬──────┘                                      │
│         │                                              │
│         ├──→ [Development] → Expo Dev Client           │
│         │        (Test on physical devices)             │
│         │                                              │
│         ├──→ [Preview] → Internal Distribution         │
│         │        iOS: TestFlight                       │
│         │        AND: Play Internal Testing            │
│         │                                              │
│         └──→ [Production] → Store Submission           │
│                  iOS: App Store Connect               │
│                  AND: Google Play Console              │
│                                                        │
│  ┌─────────────┐                                      │
│  │ EAS Update  │ ← OTA JS bundle updates              │
│  │             │   (No app store review needed         │
│  │             │    for non-native changes)             │
│  └─────────────┘                                      │
│                                                        │
└───────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **EAS Update** allows us to push bug fixes, translation updates, and UI tweaks **instantly** to all users without waiting for App Store / Play Store review cycles. Only native module changes require a full rebuild.

---

## 10. Implementation Phases

### Phase 1: Monorepo Setup & Shared Package Extraction (Week 1)

- [ ] Initialize Turborepo workspace structure
- [ ] Extract `packages/shared` from existing `src/lib/audit/`, `src/store/`, `src/lib/translations.js`
- [ ] Update web app imports to reference `@masterkeylabs/shared`
- [ ] Verify web app still builds and all tests pass
- [ ] Initialize Expo app in `apps/mobile/` with TypeScript
- [ ] Configure NativeWind with existing design tokens

### Phase 2: Authentication & Core Navigation (Week 2)

- [ ] Implement Supabase auth with `expo-secure-store` token persistence
- [ ] Add Google Sign-In via `expo-auth-session`
- [ ] Add Apple Sign-In (iOS requirement)
- [ ] Build tab navigator skeleton (Home, Dashboard, Services, Profile)
- [ ] Port `LanguageContext` and `ThemeContext` to mobile

### Phase 3: Diagnostic Audit Suite (Weeks 3-4)

- [ ] Build mobile `DashboardIntakeWizard` with native form controls
- [ ] Port Loss Audit module (import engine directly from shared package)
- [ ] Port Night Loss module
- [ ] Port Visibility module
- [ ] Port AI Threat module
- [ ] Implement `DashboardGrid` with mobile-optimized card layout
- [ ] Wire Zustand store hydration from Supabase on login

### Phase 4: Premium UI & Native Features (Weeks 5-6)

- [ ] Implement AI Extinction Timer with Skia canvas
- [ ] Add Reanimated 3 entrance animations for dashboard cards
- [ ] Implement haptic feedback on scan completions
- [ ] Build Service Protocol catalog with detail pages
- [ ] Add `expo-blur` glassmorphism effects for premium feel
- [ ] Implement PDF report generation via `expo-print`

### Phase 5: Push, Offline & Polish (Weeks 7-8)

- [ ] Configure EAS push notification pipeline
- [ ] Implement weekly "Profit Recovery" push summaries
- [ ] Add Zustand persist middleware for offline audit support
- [ ] Configure TanStack Query mutation queue for offline sync
- [ ] Implement biometric lock (FaceID / Fingerprint)
- [ ] Deep linking: `masterkeylabs://dashboard?id=xxx`

### Phase 6: Testing, Build & Store Submission (Weeks 9-10)

- [ ] End-to-end testing on physical iOS and Android devices
- [ ] App Store screenshot generation (all required sizes)
- [ ] Privacy policy and data safety declarations
- [ ] EAS Production build → TestFlight / Play Internal → Store Review
- [ ] Launch 🚀

---

## 11. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Apple rejects due to missing Apple Sign-In | **CRITICAL** | Implement before first submission |
| Framer Motion animations don't port cleanly | Medium | Pre-plan Reanimated equivalents per component |
| Large translation file (150KB) slows startup | Medium | Lazy-load language bundles; ship only active locale |
| Expo SDK version lock limits native modules | Low | Use Development Builds (not Expo Go) for full flexibility |
| Supabase RLS policies differ for mobile tokens | Low | Same JWT, same policies — no change needed |
| PDF generation quality differs on mobile | Medium | Test `expo-print` output fidelity early in Phase 4 |

---

## Open Questions

> [!IMPORTANT]
> **Q1: Monorepo vs Standalone?** This blueprint assumes Monorepo (recommended). If you prefer a standalone mobile repo, the `packages/shared` extraction still happens, but as a published npm package instead of a workspace link. **Please confirm your preference.**

> [!IMPORTANT]
> **Q2: Apple Developer Account.** Do you already have an Apple Developer Program membership ($99/year)? This is required for TestFlight and App Store submission. Google Play requires a one-time $25 registration fee.

> [!IMPORTANT]
> **Q3: Push Notification Backend.** Weekly P&L push summaries require a scheduled Edge Function on Supabase (or a cron service). Should we implement this as part of the mobile project, or defer to a later sprint?

> [!IMPORTANT]
> **Q4: Feature Parity vs Mobile-First.** Should the mobile v1.0 ship with **full feature parity** (all 4 audit modules + AI Timer + Services + Reports), or a **focused MVP** (Dashboard + Audit + Timer only)?

---

**Awaiting your review and decisions on the open questions before initiating Phase 1.**
