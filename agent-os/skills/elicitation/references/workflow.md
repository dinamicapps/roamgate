---
name: elicitation-workflow
description: Complete elicitation workflow reference - method selection, execution loop, and integration protocol.
---

# Elicitation Workflow

This document consolidates the full elicitation workflow for reference by the skill executor.

## Activation Flow

```
Activation
    │
    ▼
Load methods.csv (50 methods across 11 categories)
    │
    ▼
Read project config if available
    │
    ▼
Analyze conversation context
    │
    ▼
Smart-select 5 methods matching context
    │
    ▼
Present options menu
    │
    ▼
┌─── Execution Loop ◄──────────────────┐
│                                       │
│   User selects 1-5, r, a, or x       │
│       │                               │
│       ├─ 1-5: Execute method          │
│       │       Show enhanced output    │
│       │       Ask apply? (y/n)        │
│       │       Re-present menu ────────┘
│       │
│       ├─ r: Reshuffle 5 new methods
│       │       Re-present menu ────────┘
│       │
│       ├─ a: Show all 50 methods
│       │       User picks one
│       │       Execute method ─────────┘
│       │
│       ├─ x: Proceed / Complete
│       │       Return enhanced content
│       │       Signal completion
│       │
│       ├─ Direct feedback text
│       │       Apply to content
│       │       Re-present menu ────────┘
│       │
│       └─ Multiple numbers (e.g. "1,3")
│               Execute in sequence
│               Re-present menu ────────┘
│
└─── End
```

## Method Categories

| Category | Count | Focus |
|----------|-------|-------|
| collaboration | 10 | Multi-persona discussions, debates, focus groups |
| advanced | 6 | Structured reasoning techniques (Tree/Graph of Thoughts, etc.) |
| competitive | 3 | Adversarial and stress-testing approaches |
| technical | 5 | Architecture, code review, security, performance |
| creative | 6 | Ideation, lateral thinking, cross-domain innovation |
| research | 3 | Evidence review, thesis defense, comparative analysis |
| risk | 5 | Pre-mortem, failure modes, chaos testing |
| core | 6 | Fundamental techniques (First Principles, Socratic, 5 Whys) |
| learning | 2 | Feynman Technique, Active Recall |
| philosophical | 2 | Occam's Razor, ethical dilemmas |
| retrospective | 2 | Hindsight reflection, lessons learned |

## Integration Protocol

When this skill is invoked from another workflow (e.g. via an `[A]` option):

1. **Receive context:** The invoking workflow passes the current section content
2. **Iterative refinement:** The user selects methods to apply, building on each enhancement
3. **Return on x:** When the user selects `x`, the final enhanced content is returned to the invoking workflow
4. **Content replacement:** The enhanced content replaces the original section in the output document
5. **Workflow continues:** The invoking workflow resumes from where it left off

## Method Execution Protocol

When executing any method from the CSV:

1. Read the method's `description` field to understand its purpose and approach
2. Use the `output_pattern` as a structural guide for the analysis flow
3. Apply the method to the current content being refined
4. Adapt complexity to match the content (simple content gets lighter treatment)
5. For multi-persona methods, clearly identify each viewpoint or role
6. Present the enhanced output with clear indication of what changed and why
7. Ask the user to approve, reject, or modify the proposed changes
8. Preserve all approved enhancements for subsequent method applications
