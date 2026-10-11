# SnapFix repository context

> Snapshot checked on 2026-10-11. The working branch at the time this file was
> created is `feat/pothole-ai` at `7a8a30b`. This file describes implemented
> code, tracked configuration, and locally present ignored AI artifacts. Large
> `ANTIGRAVITY_*` and `SnapFix_CT_*` documents are design/build specifications;
> they are not evidence that every described feature is implemented.

## 1. Product overview

SnapFix CT is a responsive web/PWA prototype for reporting and managing local
urban infrastructure incidents such as potholes, flooding, garbage, damaged
street lights, fallen trees, and exposed electrical wires. It models a citizen
submission as an `Observation` and the real-world issue being tracked as an
`Incident`; multiple observations can point to one incident.

This is a prototype, not a production integration with a government agency.
There is no real backend, authentication, database, notification system, or
official agency connection in the repository.

### Citizen flow

Two partially overlapping citizen implementations currently exist:

1. `src/app/page.tsx` is an all-in-one, mobile-style demo. It contains a local
   role chooser, camera/library input, GPS/EXIF handling, a hard-coded async AI
   simulation, editable report text, local history, and submission into
   `ReportContext`.
2. `src/app/report/*` is a separate multi-route reporting wizard:
   `new -> capture/upload -> review -> location -> duplicate -> confirm -> success`.
   Draft images and form data are stored in IndexedDB. Confirmation currently
   marks a draft `PENDING_SYNC`; it does not submit to a server.

The multi-route flow provides deterministic location consistency, evidence
confidence, a 30 m same-category duplicate candidate check against demo data,
and mock AI-assisted title/description drafting. `/dashboard` shows seeded
citizen incidents and IndexedDB drafts, while `/incidents/[id]` is the public/
citizen incident detail and timeline.

The all-in-one homepage uses `ReportContext`; the multi-route flow uses
IndexedDB plus domain demo repositories. These stores are not synchronized and
should not be treated as one persisted source of truth.

### Officer flow

The base implementation on `main`/`feat/pothole-ai` has an officer shell,
dashboard, and a basic incident detail. The basic detail directly changes
`NEW -> IN_PROGRESS` and `IN_PROGRESS -> RESOLVED`; it is older than the full
workflow below.

The complete prototype workflow is implemented separately on branch
`feat/officer-flow` and has not been merged into `main` or `feat/pothole-ai`:

```text
NEW -> VERIFIED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
  \-> CANCELLED
```

Vietnamese officer labels on that branch are:

| Domain status | UI label |
| --- | --- |
| `NEW` | Chờ duyệt |
| `VERIFIED` | Đã tiếp nhận |
| `ASSIGNED` | Đã phân công |
| `IN_PROGRESS` | Đang xử lý |
| `RESOLVED` | Chờ xác nhận |
| `CLOSED` | Đã hoàn thành |
| `CANCELLED` | Từ chối |

`feat/officer-flow` contains a responsive dashboard, searchable/filterable
report list, detailed read model, review/rejection, team/officer assignment,
processing start, resolution note/image upload, completion confirmation, and an
event timeline. Transitions are validated in domain helpers and services, not
in React components. Mutations go through Next.js server actions and append
`IncidentEvent` records.

Officer data on that branch uses process-level singleton in-memory repositories.
It survives navigation and reloads while the same server process is alive, but
it resets when the server process restarts. Resolution images are compressed by
the client, sent to a server action, and retained as in-memory data URLs; there
is no durable object storage.

### AI flow

There are currently two unrelated AI layers:

- `src/lib/ai/adapter.ts` defines an `AIReportAssistant` interface and a
  deterministic `MockAIReportAssistant`. It does not call an external model.
- `ai/pothole/` is an isolated Python/Ultralytics YOLO11 training and inference
  pipeline. It is not connected to the Next.js app or services.

The primary computer-vision target is consistent one-class object detection:
`0 = Pothole`. A secondary two-class benchmark exists with
`0 = HighRiskPothole`, `1 = Pothole`; it must not replace the one-class model.

## 2. Current technology stack

### Frontend

- Next.js `16.3.8`, App Router, React `19.2.8`, TypeScript 5.
- Tailwind CSS 4 through `@tailwindcss/postcss`.
- shadcn/ui `base-nova`, Base UI primitives, CSS variables, and reusable
  controls in `src/components/ui/`.
- Lucide React icons.
- Recharts for officer charts.
- `date-fns`, Zod, React Hook Form dependencies.
- All changes to Next.js code must follow `AGENTS.md` and the installed Next.js
  documentation under `node_modules/next/dist/docs/`.

### Backend and data

- No API routes and no deployed backend.
- Domain models and repository interfaces are TypeScript files under
  `src/domain/` and `src/lib/repositories/`.
- `DemoRepositories.ts` provides in-memory repositories seeded from
  `mockData.ts`.
- `ReportContext.tsx` is a separate client-side React state store used by the
  all-in-one homepage and the base officer dashboard.
- IndexedDB (`idb`) stores multi-step citizen draft observations locally.
- `@supabase/supabase-js` is installed, but there are no Supabase imports,
  client initialization, environment bindings, schemas, or queries.

### AI

- Python, Ultralytics `8.4.175`, pretrained YOLO11, PyTorch/torchvision CUDA
  wheels on Windows, and PyYAML.
- Training starts from pretrained weights; the default shared config is
  YOLO11n, 640 px, batch 4, 80 epochs, workers 2, AMP, patience 15, seed 42.
- The training script requires an explicit dataset YAML and does not default to
  the archived HighRisk dataset.

### PWA, maps, and storage

- `@serwist/next` and `src/sw.ts` provide precaching/default runtime caching;
  the service worker is disabled in development.
- `public/manifest.json` provides a standalone PWA manifest.
- IndexedDB supports draft persistence, but true background synchronization is
  not implemented.
- Leaflet/React Leaflet renders OpenStreetMap tiles for public maps and manual
  location selection.
- Base-branch map defaults currently use Ho Chi Minh City coordinates even
  though the product copy is for Cần Thơ. The officer detail on
  `feat/officer-flow` avoids displaying out-of-area coordinates.
- There is no cloud image storage. Seed assets use mock paths, citizen drafts
  store blobs in IndexedDB, and officer resolution images are process-local on
  `feat/officer-flow`.

## 3. Main directory structure

```text
src/
  app/                         Next.js App Router pages and layouts
    report/                    Multi-step citizen reporting wizard
    incidents/[id]/            Citizen/public incident detail
    officer/                   Officer shell, dashboard, and detail
    admin/                     Static admin prototype
    manager/                   Static manager prototype
    dashboard/                 Citizen dashboard
    map/                       Public incident map
  components/
    camera/                    Browser camera + geolocation capture
    map/                       Leaflet map viewer and location picker
    ui/                        Shared shadcn/Base UI controls
    officer/                   Exists on feat/officer-flow only
  domain/
    models.ts                  Core types: users, observations, incidents, events
    confidence/                Deterministic evidence-confidence scoring
    incident/                  Duplicate matching; officer workflow helpers on branch
    location/                  Haversine/location consistency
    priority/                  Deterministic priority score
    routing/                   Rule-based department selection
  lib/
    ai/adapter.ts              Mock AI interface/implementation
    offline/idb.ts             IndexedDB draft store
    repositories/              Interfaces, seed data, in-memory repositories
    store/ReportContext.tsx    Separate client report store
    utils/camera.ts            GPS and EXIF helpers
  services/
    observation-service.ts     Build evidence/incident from an observation
    incident-service.ts        Basic incident read/update operations
    officer-*                  Exists on feat/officer-flow only
  sw.ts                        Serwist service worker
ai/pothole/
  configs/                     Shared training and example dataset YAML
  train.py                     Fine-tune pretrained YOLO with explicit dataset
  evaluate.py                  Validation/test evaluation and aggregate metrics
  predict.py                   JSON inference; optional annotated image with --save
  requirements.txt             Python/CUDA dependencies
  README.md                    Local pipeline usage
public/                        Manifest, favicon, and starter SVG assets
```

Other root Markdown files are detailed product/UI/build specifications from
earlier prototype work. `README.md` summarizes the intended architecture, but
the source code and branch state remain authoritative.

Ignored local-only paths include:

```text
.venv-pothole/
ai/pothole/data/
ai/pothole/models/
ai/pothole/runs/
ai/pothole/.ultralytics/
ai/pothole/**/*.pt
```

## 4. Routes currently present

The following table describes route files on `main` and therefore also on the
current `feat/pothole-ai` branch unless otherwise noted.

| Route | Current behavior |
| --- | --- |
| `/` | All-in-one mobile citizen demo with local role chooser, photo/GPS/EXIF, mock AI, report drafting, and local history. |
| `/dashboard` | Citizen dashboard over seeded domain data plus IndexedDB pending drafts. |
| `/map` | Public Leaflet/OpenStreetMap incident map from the demo incident service. |
| `/incidents/[id]` | Citizen/public incident details and event timeline; feedback buttons are prototype alerts. |
| `/report/new` | Choose live camera or existing image. |
| `/report/capture` | Browser camera capture with geolocation samples; saves an IndexedDB draft. |
| `/report/upload` | Image upload and EXIF extraction; saves an IndexedDB draft. |
| `/report/review?id=...` | Issue type, title, description, dynamic demo questions, and mock AI writing assistance. |
| `/report/location?id=...` | Manual Leaflet pin and deterministic location-consistency feedback. |
| `/report/duplicate?id=...` | 30 m same-type duplicate candidate check against seeded incidents. |
| `/report/confirm?id=...` | Final review and evidence-confidence display; marks draft `PENDING_SYNC`. |
| `/report/success` | Static submission-success screen. |
| `/officer` | Base officer dashboard using `ReportContext`; replaced by a service/read-model dashboard on `feat/officer-flow`. |
| `/officer/incidents/[id]` | Base officer detail with legacy status actions; replaced by the complete workflow on `feat/officer-flow`. |
| `/manager` | Static manager dashboard mock; buttons have no service/backend mutations. |
| `/admin` | Static system-configuration cards; no working CRUD. |

Additional route on `feat/officer-flow`:

| Route | Behavior |
| --- | --- |
| `/officer/reports` | Responsive list/cards with text search, status/priority filters, sorting, empty state, and links to `/officer/incidents/[id]`. |

The officer layout links to `/officer/map`, `/officer/statistics`,
`/officer/categories`, `/officer/users`, `/officer/reports-export`, and
`/officer/settings`, but no corresponding route files currently exist.
There are no `src/app/api/*` routes.

## 5. Officer workflow on `feat/officer-flow`

The workflow branch implements these exact allowed transitions:

1. `NEW -> VERIFIED`: officer accepts the report.
2. `NEW -> CANCELLED`: officer rejects it; a non-blank rejection reason is
   required and stored in the event note.
3. `VERIFIED -> ASSIGNED`: requires a valid active team; officer and deadline
   are optional, with officer/team and non-past deadline validation.
4. `ASSIGNED -> IN_PROGRESS`: optionally records a start note and timestamp.
5. `IN_PROGRESS -> RESOLVED`: requires non-blank result text and a validated
   JPEG/PNG/WebP result image.
6. `RESOLVED -> CLOSED`: requires an existing stored resolution and records a
   completion timestamp.

Each action uses a per-incident in-process queue to prevent concurrent/double
submissions, saves the updated incident, appends an event, and revalidates the
detail/list routes. No transition outside the relevant step is accepted.

The underlying `IncidentStatus` domain also includes `COMMUNITY_VERIFIED`,
`DUPLICATE`, and `UNROUTED`; those are not part of the requested officer happy
path above.

Key officer branch files:

- `src/domain/incident/status.ts` and step-specific transition helpers.
- `src/lib/repositories/officer-demo-repositories.ts` for the shared
  process-level singleton store.
- `src/services/officer-dashboard-service.ts` and
  `officer-report-list-service.ts` for read models.
- `src/services/officer-incident-*-service.ts` for workflow mutations.
- `src/app/officer/incidents/[id]/*-actions.ts` for validated server actions.
- `src/components/officer/` for responsive dashboard/list/detail panels.

## 6. Current pothole AI workstream

Tracked pipeline files:

- `train.py`: loads shared YAML, requires an explicit `--data`, resolves CUDA
  or CPU, fine-tunes pretrained weights, and writes a training summary.
- `evaluate.py`: evaluates a selected `val` or `test` split and writes aggregate
  precision, recall, mAP50, and mAP50-95 plus Ultralytics plots.
- `predict.py`: accepts one image and weights, outputs JSON detections containing
  `class`, `confidence`, and `[x1, y1, x2, y2]`. `--conf` defaults to 0.25 and
  `--save` writes an annotated image under
  `ai/pothole/runs/predict/<model-run-name>/`. Class names come from model
  metadata, not a hard-coded mapping.

Locally present ignored datasets/runs include the grouped one-class pothole
training experiment and the grouped two-class HighRisk benchmark. They are not
available from Git after a fresh clone.

### One-class model

- Intended production direction for pothole localization.
- Mapping: `0 = Pothole`.
- Locally trained run: `yolo11n-pothole-grouped-v1`.
- Uses a grouped split created to reduce adjacent video-frame leakage.

### Two-class HighRisk experiment

- Mapping: `0 = HighRiskPothole`, `1 = Pothole`.
- Locally trained run: `yolo11n-highrisk-v1`.
- Benchmark/experiment only; it is not an approved replacement for the
  one-class detector and is not integrated into SnapFix.
- The source annotations have inconsistent semantics: HighRisk boxes are
  usually local around damage, while Pothole boxes are commonly near full
  image. Evaluation showed a strong relationship between box area and predicted
  class, so high metrics can reflect an annotation-size shortcut rather than a
  reliable severity distinction.
- Source annotations were intentionally not edited or relabeled. A grouped
  derived split was used to remove identifiable source/video overlap.

Datasets, grouped derivatives, Ultralytics runs, visualizations, pretrained and
trained weights (`best.pt`, `last.pt`) are all ignored by Git. Do not assume
that local artifact paths exist on another machine or CI runner.

## 7. Git and branch state

Branches observed locally and on `origin`:

| Branch | Head at snapshot | Contents |
| --- | --- | --- |
| `main` | `9ec1e03` | Base citizen/report/domain prototype and legacy officer UI. |
| `feat/officer-flow` | `e8d2f39` | Full officer dashboard/list/detail workflow through completion. |
| `feat/pothole-ai` | `7a8a30b` | Current branch; base app plus isolated YOLO pipeline and prediction visualization. |

Both feature branches share `9ec1e03` as their merge base. They are parallel
workstreams: `feat/pothole-ai` does not contain the officer-flow commits, and
`feat/officer-flow` does not contain the AI commits.

Important commit sequence:

```text
main:
  9ec1e03 feat: implement full functional flow and report context

feat/officer-flow:
  9d23a00 feat(officer): refactor officer dashboard
  943955c feat(officer): add report list
  3f97a91 feat(officer): add report detail
  569be72 feat(officer): add report review actions
  8b168e8 feat(officer): add report assignment
  48c1e2a feat(officer): add processing start action
  ec8e892 feat(officer): add resolution submission
  e8d2f39 feat(officer): add completion confirmation

feat/pothole-ai:
  81a5e99 feat(ai): add pothole training pipeline
  b0fb05b refactor(ai): support explicit pothole datasets
  7a8a30b feat(ai): add prediction visualization
```

## 8. Known unfinished work and TODOs

- Real backend/API and durable database are absent.
- Authentication, sessions, authorization, and route guards are absent. The
  homepage role chooser is UI state, not auth.
- Supabase is only a package dependency; integration is not implemented.
- Durable asset/object storage and privacy/redaction pipeline are absent.
- Citizen IndexedDB drafts are not truly background-synced to a server.
- The deterministic duplicate helper exists, but it only checks seeded demo
  incidents; production duplicate detection and a shared persisted data source
  are not implemented.
- Priority scoring exists for severity, age, and report count, but it is only
  recalculated during observation creation/attachment. There is no scheduled
  escalation or production SLA job.
- Rule-based department routing exists during incident creation, but complete
  agency/area routing administration and production team routing are absent.
- YOLO inference is not connected to citizen/officer UI, Next.js services, or
  an inference API. Model packaging/deployment is absent.
- Web AI remains mocked; there is no Gemini/OpenAI/vision provider call.
- `feat/officer-flow` still needs deliberate integration with `main`/the AI
  branch; it must not be assumed present on the current branch.
- Manager and admin pages are static prototypes without working management
  operations.
- Several officer navigation destinations do not have pages.
- Public/citizen feedback actions on incident detail are alert placeholders.
- The base map's default coordinates are not aligned with the Cần Thơ product
  setting.
- The repository has no tracked unit, integration, or end-to-end test suite.
- There are parallel data/status models (`ReportContext` Vietnamese statuses
  and domain `IncidentStatus`) and parallel citizen flows. Consolidation has
  not been completed.
- `ReportContext.Report.status` does not declare the homepage's `"Đã gửi"`
  value even though the homepage assigns it; this is an existing type/model
  inconsistency.
- `DemoRepositories` instances are not globally shared in the base services;
  separate service instances can hold separate in-memory copies. The officer
  branch solves this only for officer incidents/events/resolutions through its
  dedicated singleton repository module.

## 9. Files and areas to change carefully

- `src/app/page.tsx`, `src/app/report/**`, `src/app/dashboard/page.tsx`, and
  `src/app/incidents/[id]/page.tsx`: two existing citizen experiences depend on
  different stores. Check which flow is in scope before changing either.
- `src/lib/store/ReportContext.tsx`: base homepage/officer dashboard share its
  report objects and status mutations. Changes can break both surfaces.
- `src/domain/models.ts`, `src/lib/repositories/interfaces.ts`,
  `DemoRepositories.ts`, and `mockData.ts`: services and multiple routes depend
  on these contracts and seeded identifiers.
- `src/services/observation-service.ts`: combines evidence confidence,
  location consistency, duplicate attachment, priority, routing, and event
  creation. Changing one domain contract affects the full report flow.
- Officer files on `feat/officer-flow`: preserve the shared singleton store,
  transition helpers, server-action validation, event timeline, and responsive
  UI. Do not replace them with legacy `ReportContext` mutations.
- `src/lib/offline/idb.ts`: changing schema or object-store versions can make
  existing browser drafts unreadable; use an IndexedDB migration.
- `ai/pothole/data`, `models`, `runs`, `.ultralytics`, and all `.pt` files:
  local/ignored, potentially large, and not source code. Do not add them to Git.
- `ai/pothole/configs/train.yaml`: intentionally has no dataset path. Keep
  datasets explicit so the archived HighRisk dataset cannot be trained by
  accident.
- `AGENTS.md`: generated Next.js agent rules require reading installed Next.js
  docs before editing framework code.
- `package-lock.json`: update only through an intentional dependency change.

## 10. Practical handoff notes

- Determine the target branch before working. The current AI branch and officer
  branch contain different feature sets.
- Treat repository interfaces/services as the intended seam for replacing demo
  storage with APIs. Avoid embedding new mutations directly in React views.
- Treat all AI outputs as advisory. No current code authorizes automatic civic
  decisions.
- Do not describe the prototype as integrated with a real government system.
- Before relying on a route named in a design specification or officer nav,
  verify that a matching `src/app/**/page.tsx` actually exists.
