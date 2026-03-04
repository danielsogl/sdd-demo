<!--
  SYNC IMPACT REPORT
  ==================
  Version change: (unversioned template) → 1.0.0
  Added principles:
    - V. API-First Design
    - VI. Ubiquitous Language Enforcement
    - VII. Vertical Slice Architecture
    - VIII. Definition of Done
    - IX. No Magic Numbers & No Primitive Obsession
    - X. Observability by Default
    - XI. Security by Design
    - XII. Dependency Management
  Modified sections:
    - Development Workflow: added API contract step
    - Quality Gates: extended with DoD, security, observability, dependency gates
    - Governance: updated principle count from four to twelve
  Removed sections: N/A
  Templates reviewed:
    - .specify/templates/plan-template.md ✅ Constitution Check section covers new principles
    - .specify/templates/spec-template.md ✅ No changes required
    - .specify/templates/tasks-template.md ✅ No changes required
  Follow-up TODOs: None.
-->

# Spec-Driven Development Workshop Constitution

## Core Principles

### I. Test-First with BDD/Gherkin (NON-NEGOTIABLE)

All feature behavior MUST be captured as Gherkin scenarios (`Given / When / Then`) in a spec
before any production code is written. Tests MUST be written first, verified to FAIL, and only
then implemented (Red → Green → Refactor). Acceptance criteria MUST be expressed as executable
specifications. No production code MAY be merged without a corresponding failing test that was
written beforehand.

**Rationale**: BDD scenarios serve as living documentation and alignment contracts between
stakeholders and developers. Writing tests first prevents scope creep, clarifies requirements,
and eliminates ambiguity before implementation begins.

### II. Domain-Driven Design

Code MUST be structured around the problem domain, not technical layers. Each feature MUST
identify its Bounded Contexts, Aggregates, Entities, Value Objects, and Domain Services before
implementation. The ubiquitous language defined in the domain model MUST be used consistently
in code, tests, documentation, and team communication. Infrastructure concerns (persistence,
transport, UI) MUST be separated from domain logic via ports and adapters (Hexagonal
Architecture).

**Rationale**: Domain-centric structure ensures the codebase reflects the business reality,
making it easier to reason about, extend, and hand off to new team members. It prevents
the accretion of technical debt caused by layering business logic inside infrastructure code.

### III. SOLID Principles

All code MUST adhere to the five SOLID principles at all times:

- **Single Responsibility**: Every class, module, or function MUST have exactly one reason to
  change.
- **Open/Closed**: Modules MUST be open for extension and closed for modification. New behavior
  MUST be added via extension, not by editing existing code.
- **Liskov Substitution**: Subtypes MUST be substitutable for their base types without altering
  correctness.
- **Interface Segregation**: Clients MUST NOT be forced to depend on interfaces they do not use.
  Prefer narrow, role-specific interfaces over fat interfaces.
- **Dependency Inversion**: High-level modules MUST NOT depend on low-level modules. Both MUST
  depend on abstractions. Abstractions MUST NOT depend on details.

**Rationale**: SOLID compliance produces code that is maintainable, testable, and resilient to
change. Violations MUST be documented in the Complexity Tracking table with explicit justification.

### IV. Mobile-First & Responsive Design

All UI implementations MUST be designed and built starting from the smallest viewport (mobile)
and progressively enhanced for larger screens. CSS and layout MUST use fluid, relative units and
responsive breakpoints. No UI component MAY be considered complete unless it has been verified
on mobile, tablet, and desktop viewports. Accessibility (WCAG 2.1 AA) MUST be validated
alongside responsive behavior.

**Rationale**: The majority of users access applications on mobile devices. Designing mobile-first
ensures core functionality and usability are never sacrificed for desktop aesthetics, and
progressive enhancement is more robust than degrading from desktop.

### V. API-First Design

All interfaces (REST, GraphQL, Events, etc.) MUST be defined as explicit contracts (OpenAPI,
AsyncAPI, or equivalent schema format) before any frontend or backend implementation begins.
The contract MUST be reviewed and agreed upon as part of the planning phase. No implementation
MAY diverge from the agreed contract without a formal amendment to the contract artifact.

**Rationale**: API-first bridges the gap between BDD specifications and implementation. It
enables parallel frontend/backend development, acts as a machine-verifiable contract, and
prevents integration surprises late in the cycle.

### VI. Ubiquitous Language Enforcement

All code identifiers — class names, method names, variable names, database column names, API
field names, and event names — MUST directly reflect the domain's ubiquitous language as
defined in the domain model. Abbreviations, technical aliases (`userObj`, `data`, `mgr`,
`tmp`), and implementation-leaking names are PROHIBITED. Renaming MUST be propagated
consistently across all layers.

**Rationale**: Consistent language between domain experts and code eliminates translation
overhead, reduces misunderstandings, and makes the codebase self-documenting. It is the
primary mechanism by which DDD delivers long-term maintainability.

### VII. Vertical Slice Architecture

Each feature MUST be delivered as a complete vertical slice: from UI through application layer,
domain, and persistence. Horizontal layer deliveries ("all models first, then all services")
are PROHIBITED. Each user story MUST be independently deployable and demonstrable at its
completion. Cross-cutting infrastructure is the only exception and MUST be completed in the
Foundational phase before slices begin.

**Rationale**: Vertical slices eliminate integration risk, enable early user feedback, and
align delivery directly with user value. They enforce the independent testability required
by the BDD and DDD principles.

### VIII. Definition of Done (NON-NEGOTIABLE)

A task or user story is ONLY considered done when ALL of the following criteria are met:

- All Gherkin scenarios pass as automated tests.
- No SOLID principle is violated (or violation is justified in Complexity Tracking).
- Domain model identifiers are used consistently throughout the slice.
- UI has been verified on mobile (≤480px), tablet (≤1024px), and desktop (≥1280px).
- Accessibility audit (WCAG 2.1 AA) passes.
- API contract matches the implemented behavior.
- Structured logging is present for all domain-relevant operations.
- Code has been peer-reviewed.
- Documentation (spec, plan, or quickstart) has been updated to reflect changes.
- Code coverage has not decreased relative to the pre-task baseline.

**Rationale**: An explicit, shared DoD makes "done" objective and non-negotiable. It prevents
the accumulation of hidden technical debt disguised as completed work.

### IX. No Magic Numbers & No Primitive Obsession

All domain-significant values MUST be represented as named constants or Value Objects — never
as raw primitives scattered through business logic. Examples: `Money`, `Email`, `UserId`,
`Percentage`, `DateRange` instead of `number`, `string`, `Date`. Magic literals in logic
are PROHIBITED and MUST be extracted to named constants with a clear domain meaning.

**Rationale**: Primitive obsession is one of the most pervasive DDD violations. Value Objects
encode domain invariants, make illegal states unrepresentable, and improve readability by
carrying meaning rather than just data.

### X. Observability by Default

Every domain-relevant operation MUST emit structured logs with a consistent schema (including
Correlation IDs for request tracing). Silent failures are PROHIBITED — all caught exceptions
MUST be logged with sufficient context for diagnosis. Metrics for key domain events MUST be
defined in the plan and implemented alongside the feature, not added later.

**Rationale**: Observability cannot be bolted on after the fact. Building it in from the start
ensures production systems are diagnosable, and aligns with the principle that domain events
are first-class citizens deserving explicit representation.

### XI. Security by Design

OWASP Top 10 risks MUST be assessed for every feature during the planning phase and documented
in `plan.md`. Input validation MUST occur at system boundaries (ports/adapters) — never deep
within domain logic. Authentication and authorization MUST be treated as cross-cutting concerns
with explicit design decisions, not afterthoughts. No secrets MAY be hardcoded or committed to
version control.

**Rationale**: Security vulnerabilities introduced during development are exponentially more
expensive to fix after deployment. Explicit security review at the planning gate prevents the
most common classes of vulnerabilities from entering the codebase.

### XII. Dependency Management

Every external dependency MUST be explicitly justified with a make-or-buy decision documented
in `plan.md`. Dependencies MUST be evaluated for: license compatibility, maintenance health,
security vulnerability history, and bundle size impact. Transitive dependencies MUST be audited
at the time of adoption. Dependencies MUST NOT be added without team awareness.

**Rationale**: Uncontrolled dependency growth is a primary source of supply-chain risk,
license exposure, and long-term maintenance burden. Explicit justification creates
accountability and prevents "dependency by habit."

## Development Workflow

Every feature MUST follow this mandatory sequence before code is merged:

1. **Specify** — Write or update `spec.md` with Gherkin acceptance scenarios.
2. **Contract** — Define API contracts (OpenAPI/AsyncAPI) before any implementation.
3. **Plan** — Produce `plan.md` with DDD domain model, bounded contexts, security assessment,
   dependency decisions, and project structure.
4. **Tasks** — Generate `tasks.md` with test tasks listed BEFORE implementation tasks,
   organized as vertical slices per user story.
5. **Red** — Implement and run the tests; confirm they FAIL.
6. **Green** — Write the minimum production code to make tests pass.
7. **Refactor** — Clean up code while keeping tests green; enforce SOLID, DDD, and Value Objects.
8. **Review** — Verify Definition of Done checklist, responsive/mobile behavior, and
   observability before merge.

## Quality Gates

The following gates MUST be enforced on every pull request or merge:

- All Gherkin scenarios have corresponding automated tests written before implementation.
- No new class or module violates a SOLID principle (violations require Complexity Tracking entry).
- All domain identifiers use ubiquitous language — no primitive obsession, no magic numbers.
- API implementation matches the agreed contract artifact.
- UI changes verified on mobile (≤480px), tablet (≤1024px), and desktop (≥1280px).
- Accessibility audit (WCAG 2.1 AA) passes for all new UI components.
- Structured logging with Correlation IDs is present for all domain operations.
- OWASP Top 10 assessment documented for the feature in `plan.md`.
- New dependencies are documented with make-or-buy justification in `plan.md`.
- Code coverage MUST NOT decrease relative to the pre-PR baseline.
- Full Definition of Done checklist (Principle VIII) is satisfied.

## Governance

This constitution supersedes all other development practices and conventions. Any practice that
contradicts a principle in this document MUST be discontinued.

**Amendment procedure**: Amendments require a written rationale, an assessment of impact on
existing specs and tasks, and an updated Sync Impact Report comment at the top of this file.
The version MUST be incremented according to semantic versioning:
- MAJOR — Principle removal or backward-incompatible redefinition.
- MINOR — New principle or section added, or materially expanded guidance.
- PATCH — Wording clarifications, typo fixes, non-semantic refinements.

**Compliance review**: Every `plan.md` Constitution Check section MUST explicitly verify all
twelve principles before Phase 0 research begins and again after Phase 1 design. Non-compliance
MUST be justified in the Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
