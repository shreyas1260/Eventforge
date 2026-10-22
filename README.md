# EventForge AI

**Product Tagline:** *Plan the event. Prepare for anything.*  
**Challenge:** Hack2skill Challenge 5 — AI Code Submission  
**Design System:** Warm Editorial Productivity (Newsreader & Inter, Warm Ivory `#F8F7F3`, Terracotta `#94442A`, Sage `#52634D`)

---

## What is EventForge AI?

EventForge AI is a GenAI-powered event planning and decision-support platform designed for the Indian market. It transforms rough ideas into complete, editable, budget-aware plans for **weddings, birthdays, community celebrations, and college fests**.

Its defining differentiator is the **AI Event Twin + Scenario Lab**: a digital representation of the event that lets organizers simulate disruptions—such as budget cuts, rain forecasts, guest surges, and vendor cancellations—compare original vs. proposed plans side-by-side with exact mathematical differences, and selectively apply changes with automatic rollback snapshots.

---

## Signature Workflow

$$\text{Plan} \longrightarrow \text{Simulate} \longrightarrow \text{Compare} \longrightarrow \text{Decide} \longrightarrow \text{Apply}$$

1. **Plan:** Enter event requirements; Google Gemini & rule-based engines synthesize structured budgets, timelines, and vendor arrangements.
2. **Simulate:** Explore real-world disruptions in the **Scenario Lab** without altering your live plan.
3. **Compare:** Inspect side-by-side calculated differences (limits, line items, and schedule shifts).
4. **Decide:** Selectively check individual adjustments you approve.
5. **Apply:** Commit changes to your live plan with automatic safety snapshot creation for 1-click rollback.

---

## Core Capabilities

- **AI Event Twin & Scenario Lab:**
  - **Scenario A (Budget Reduction):** Simulates budget cut (e.g., 20%), trims discretionary categories (decor, entertainment) while safeguarding core venue & catering.
  - **Scenario B (Bad Weather):** Simulates rain/storm forecast, injects waterproof canopy rental and indoor dining backup into budget and timeline.
  - **Scenario C (Increased Guest Count):** Recalculates catering plate allocations, seating inventory, and venue capacity limit.
  - **Scenario D (Vendor Cancellation):** Deploys emergency replacement checklists and compresses decision deadlines.
  - **Selective Application:** Toggle individual proposed line items before committing.
  - **Snapshot History:** Rollback to any prior plan version with 1 click.
- **Budget Intelligence:**
  - Deterministic calculations for planned spending, actual spending, and remaining buffer in Indian Rupees (`₹`, Lakhs, Crores).
  - Category breakdown distribution and over-budget alerts.
- **Timeline & Deadline Radar:**
  - Chronological preparation milestones.
  - Radar flags overdue tasks and tasks due in the next 7 days.
- **Vendor Command Center:**
  - Categorized supplier management (quotes tracked separately from confirmed actual spending).
  - Suggested negotiation questions for venue and caterers.
- **Personalized Ideas Studio:**
  - Creative concepts filtered by theme, food, decor, and eco-friendly options.
  - One-click "Add to Plan" converts ideas directly into active timeline tasks.
- **Rule-Derived Plan Health Score:**
  - Transparent 0–100 score based on budget balance, overdue deadlines, supplier confirmations, and contingency reserves.
- **Print & Export:**
  - Clean, dedicated printer stylesheet (`@media print`) for master event documentation.

---

## Local Setup & Development

### 1. Prerequisites
- Node.js v18+ (Tested on Node v24)
- npm v10+

### 2. Installation
```bash
git clone <your-repo-url>
cd eventforge-ai
npm install
```

### 3. Environment Configuration
Copy the example file and add your own Gemini API key (get one at https://aistudio.google.com/apikey):
```bash
cp .env.example .env
```
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
> Never commit `.env` — it is listed in `.gitignore`. The API key is only used by the backend server and is never sent to the browser.

### 4. Running Locally
Run both the backend Express server and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### 5. Running Automated Tests
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```
