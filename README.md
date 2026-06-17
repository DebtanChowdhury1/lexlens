# LexLens — AI Contract Analyzer

LexLens is a full-stack SaaS application that analyzes legal contracts using AI. Upload a PDF or DOCX and get a plain-English breakdown of every clause, a risk score, red flag detection, and an exportable report — in seconds.

**Live:** [lexlens.vercel.app](https://lexlens.vercel.app)

---

## Features

- **AI-powered clause analysis** — powered by Groq `llama-3.3-70b-versatile` with Gemini `gemini-2.0-flash` as fallback
- **Risk scoring** — every clause scored 0–100; overall contract risk level (Safe / Caution / Danger / Critical)
- **Plain-English summaries** — no legal jargon, just what the clause actually means
- **Red flag detection** — highlights clauses that need your attention
- **Risk heatmap** — visual grid overview of all clauses at a glance
- **PDF export** — download your full report as a PDF
- **Contract history** — all past analyses saved to your account with pagination
- **Inline rename** — rename any contract directly from the report page
- **Demo page** — try a sample report without signing up at `/demo`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Clerk v7 |
| Database | MongoDB + Mongoose |
| AI (primary) | Groq — llama-3.3-70b-versatile |
| AI (fallback) | Google Gemini 2.0 Flash |
| UI | Tailwind CSS, Radix UI, Framer Motion |
| 3D Hero | Three.js + React Three Fiber |
| PDF parsing | pdf-parse, mammoth (DOCX) |
| PDF export | jsPDF + html2canvas |
| Tests | Vitest (34 tests) |
| Deployment | Vercel |

## Getting Started

```bash
git clone https://github.com/DebtanChowdhury1/lexlens.git
cd lexlens
npm install --legacy-peer-deps
```

Create a `.env.local` file (see `.env.example` for all required variables):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
MONGODB_URI=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (marketing)/     # Public pages: home, demo, terms, privacy
  (dashboard)/     # Auth-protected: dashboard, analyze, report, settings
  api/             # Route handlers: analyze, contracts, export, health, user
components/
  analysis/        # ClauseCard, RiskHeatmap, RiskMeter, RedFlagBanner
  dashboard/       # ContractCard, StatsBar
  three/           # HeroScene, AnalysisScene, AmbientBackground
  ui/              # Button, Badge, Card, Tooltip
lib/
  ai/              # Groq + Gemini clients, core analyze logic
  db/              # Mongoose connection, Contract model
  pdf/             # PDF parsing, PDF export
__tests__/         # Vitest unit tests
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload and analyze a contract |
| `GET` | `/api/contracts` | List contracts (paginated) |
| `GET` | `/api/contracts/[id]` | Get a single contract |
| `PATCH` | `/api/contracts/[id]/rename` | Rename a contract |
| `GET` | `/api/export/[id]` | Export contract as PDF |
| `DELETE` | `/api/user` | Delete all user data (GDPR) |
| `GET` | `/api/health` | Health check |

## Running Tests

```bash
npm test
```

34 tests covering risk scoring, text windowing, AI response parsing, magic byte validation, and input sanitization.

## License

MIT
