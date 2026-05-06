# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

## Commands

### Backend (Kotlin/Ktor)
Run from `backend/`:
```bash
./gradlew run          # start server on :8080
./gradlew build        # compile + test
./gradlew test         # tests only
```

### Frontend (React/Vite)
Run from `frontend/`:
```bash
npm run dev            # dev server on :5173 (proxies /api/* → :8080)
npm run build          # tsc + vite → dist/
```

For dev, run both simultaneously — backend on :8080, frontend on :5173.

## Architecture

For architecture details, data flow, API contract, module types, generated output structure, and frontend component map see: @docs/architecture.md
