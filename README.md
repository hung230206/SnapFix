# SnapFix

SnapFix is a civic incident management demo built with Next.js 16 (App Router), Tailwind CSS, and shadcn/ui. The citizen flow prepares reports for officers to receive within SnapFix; direct submission remains disabled until the receiving department and backend are connected.

## Core Concepts & Architecture

### Observation vs Incident
The most critical architectural pattern in this system is the separation between **Observations** and **Incidents**:
- **Observation:** A single submission/evidence package from one citizen (e.g., a photo, GPS, and timestamp of a pothole).
- **Incident:** The actual real-world problem (e.g., the pothole itself). Multiple Observations from different citizens can be attached to the same Incident.

### Application Areas (Roles)
- **Public / Citizen:**
  - `()` - Homepage explaining the product.
  - `(/map)` - Public map showing aggregated Incidents.
  - `(/dashboard)` - Citizen dashboard to track personal Observations and related Incidents.
  - `(/report/*)` - Multi-step reporting wizard (Capture -> Review -> Location -> Duplicate Check -> Confirm).
- **Officer:**
  - `(/officer)` - Operations dashboard to view assigned incidents and update statuses.
  - `(/officer/incidents/[id])` - Detail view to inspect evidence provenance, location consistency, and upload resolutions.
- **Manager:** `(/manager)` - Dashboard to oversee department SLAs, assignments, and unresolved backlogs.
- **Admin:** `(/admin)` - Configuration area for routing rules, dynamic forms, and AI adapters.

### Evidence & Location Logic
- **Location Consistency Service:** Calculates the Haversine distance between the image's original capture GPS (or EXIF metadata) and the manual pin dropped by the user. Returns confidence warnings if there is a severe mismatch.
- **Evidence Confidence Engine:** Rule-based engine scoring an Observation's validity based on whether it was captured live in the app, the GPS accuracy radius, and age of the photo.

### AI Adapter Architecture
The system logic is designed to function 100% without AI. AI features (like suggesting issue types, drafting descriptions, or explaining evidence) are wrapped in an `AIAdapter` interface (`MockAIReportAssistant`). This provides a clean integration point for future connections to LLM providers (e.g., Gemini Pro Vision) while keeping the core domain rules deterministic.

### Demo Mode & Offline Behavior
- Lacking a real backend, the app implements a robust **Demo Mode** via `DemoRepositories.ts`, acting as an in-memory database seeded with `mockData.ts`.
- The citizen reporting flow utilizes IndexedDB (`idb.ts`) to save draft Observations step-by-step. This supports offline capturing—reports remain in the "Pending Sync" state until connectivity is restored (simulated).

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## Next Steps / Future Work
### Citizen MVP frontend demo
- The home page now submits independent reports to IndexedDB; `/officer/reports` and the officer dashboard read these same submissions. This is local browser data, not delivery to a real authority.
- No YOLO inference is performed. Citizens confirm the category manually; classification confidence is unavailable. The image step no longer asks for danger/severity.
- After submission, reports of the same known category within 30 metres and 7 days share an incident reference. Missing coordinates and unknown categories stay separate. Each report retains its own photo, description and ID.
- Demo priority uses report count only: 1–2 LOW, 3–4 MEDIUM, 5+ HIGH. These are prototype rules, not validated danger assessments or verified unique-person counts.
- Submission and history writes are atomic and retry-safe. Deleting a history copy does not withdraw the submitted demo report. Clearing browser site data removes the demo submissions.
- Submitted records enter NEW (Chờ duyệt). The complete eight-step officer workflow described in the reference document is not present in this checkout; this inbox is the frontend handoff point for later integration.
- Verify with `node --experimental-strip-types --test tests/*.test.mjs` and `npm run build`.

### Future integrations
- Connect AI Adapter to real Gemini API.
- Implement real PostgreSQL / Prisma database backend.
- Enhance PWA Service Worker for true background sync of IndexedDB drafts.
