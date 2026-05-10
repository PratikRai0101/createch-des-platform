# CreaTech DES Improvement Plan

## Phase 1 — Quick Wins (Performance & Code Quality)
- [ ] **T1**: Remove console.log spam from DigitalTwinScene.tsx (60fps perf killer)
- [ ] **T2**: Extract magic numbers to src/lib/constants.ts
- [ ] **T3**: Add loading skeleton for dynamic DigitalTwinCanvas import
- [ ] **T4**: Add React error boundary for 3D canvas
- [ ] **T5**: Unify type definitions — remove duplication across files

## Phase 2 — UX Polish
- [ ] **T6**: Add toast notification system for events/alerts
- [ ] **T7**: Add backend connection status banner
- [ ] **T8**: Mark settings page as demo mode
- [ ] **T9**: Add dark mode toggle with next-themes
- [ ] **T10**: Responsive layout — collapsible sidebar for mobile

## Phase 3 — Architecture
- [ ] **T11**: Decompose god context — extract SimulationEngine class
- [ ] **T12**: Add shared UI primitives (Button, Card, Badge, Select)
- [ ] **T13**: AI chat ↔ simulation integration (wire up generative options)

## Phase 4 — Features
- [ ] **T14**: Add audit trail page/view
- [ ] **T15**: Offline graceful degradation banner
- [ ] **T16**: Add basic test infrastructure (Vitest)

## Final Verification Wave
- [ ] **F1**: Build passes (`npm run build`)
- [ ] **F2**: No TypeScript errors (`npx tsc --noEmit`)
- [ ] **F3**: Linter clean (`npm run lint`)
- [ ] **F4**: Manual QA — click through all pages
