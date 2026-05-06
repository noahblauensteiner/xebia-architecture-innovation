# Architecture

**Purpose:** Drag-and-drop tool for designing multi-module Gradle project architectures. User places module nodes on a canvas, draws dependency edges, then generates a real Gradle project scaffold.

## Data flow

1. User builds architecture graph in React Flow canvas (`frontend/src/App.tsx`)
2. Submit calls `POST /api/generate` (`frontend/src/api/generate.ts`)
3. Vite dev proxy forwards to Ktor backend at `:8080`
4. Backend (`backend/src/main/kotlin/com/xebia/archviz/routes/GenerateRoute.kt`) calls `generateProject()`
5. Generator (`generator/ProjectGenerator.kt`) writes files to `../output/{projectName}/` (sibling of `backend/`)
6. Response returns `fileTree[]` for display + `branchUrl`/`zipDownloadUrl`

## API contract

`POST /generate` — `GenerateRequest` → `GenerateResponse`

```kotlin
// Request
data class GenerateRequest(
    val projectName: String,
    val packageName: String,
    val nodes: List<ArchNode>,       // { id, label, type, x, y }
    val edges: List<ArchEdge>,       // { id, source, target }
    val visitorEmail: String?
)

// Response
data class GenerateResponse(
    val branchUrl: String,
    val zipDownloadUrl: String,
    val fileTree: List<String>       // emoji tree for display
)
```

## Module types

Eight module types map to preset Gradle plugin/dependency bundles (`generator/ModuleDeps.kt`):
`core | database | ui | api | auth | domain | network | test`

Each type drives: which Gradle plugins apply, which dependencies are added (e.g. `database` → Exposed, `ui` → Ktor HTML), and what ArchUnit rules guard.

## Generated output structure

Every generation produces:
```
output/{projectName}/
├── settings.gradle.kts          # includes all modules + archunit-rules
├── build.gradle.kts             # root build (kotlin jvm, allprojects)
├── gradle/libs.versions.toml    # version catalog
├── {module}/
│   ├── build.gradle.kts         # type-specific plugins + deps
│   └── src/main/kotlin/…/{Module}.kt   # stub object
└── archunit-rules/              # ArchUnit test enforcing layer rules
```

## Frontend component map

- `App.tsx` — canvas state, node/edge CRUD, generate submit, QR/file-tree display
- `components/ModulePalette.tsx` — draggable module-type tiles
- `components/FileTreeDisplay.tsx` — renders emoji tree from response
- `types/architecture.ts` — `ArchNode`, `ArchEdge`, `ModuleType`, `MODULE_META` (icons, Tailwind colors)
- `api/generate.ts` — single `generateProject()` fetch wrapper

## Tailwind theme

Custom Xebia brand color: `xebia: '#f60'` (configured in `frontend/tailwind.config.js`).
