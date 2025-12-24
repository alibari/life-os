# Life OS (V3) - Technical Documentation

> **Strictly for Developers.** This branch (V3) implements the new **Habit Snapshot Engine** and **Protocol-Based Metrics**.

## 1. Technical Architecture

### Stack
- **Frontend**: React 18 (Vite)
- **Language**: TypeScript
- **State Management**: `@tanstack/react-query` (Server State) + React Context (Client State)
- **Styling**: Tailwind CSS + `shadcn/ui` (Radix Primitives)
- **Backend / Database**: Supabase (PostgreSQL 15)

### Key Architectural Decisions
- **Optimistic UI**: The app uses `react-query` to cache data but forces aggressive invalidation on mutations to ensure data consistency with the DB.
- **Client-Side Compute**: Metrics like "Neuroplasticity Index" and "System Load" are calculated client-side to reduce DB load, leveraging the `habitService` layer.
- **Edge Deployment**: Designed to run on Vercel/Netlify with connection to Supabase.

---

## 2. Database Schema (PostgreSQL)

The core logic revolves around the `habits` (Protocol) and `habit_logs` (Execution) tables.

### `public.habits` (The Protocol)
Defines the "Ideal State" or the plan.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `auth.users` |
| `name` | TEXT | Display name |
| `energy_cost` | INT | Bio-cost (1-10) for System Load calc |
| `impact_score` | INT | Contribution to Neuroplasticity (1-10) |
| `reward_pathway`| TEXT | e.g., 'dopamine_drive', 'serotonin_peace' |
| `is_active` | BOOL | Soft delete / Paused state |

### `public.habit_logs` (The Execution)
Implements the **Snapshot Pattern** to preserve history even if the Protocol changes.
- **Constraint**: `UNIQUE(user_id, habit_id, completed_at)` enforces "One Log Per Day".

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `completed_at` | TIMESTAMPTZ | Normalized to Midnight UTC (T00:00:00Z) |
| `energy_cost_snapshot` | INT | **[V3 New]** Copy of `habits.energy_cost` at time of log |
| `impact_score_snapshot` | INT | **[V3 New]** Copy of `habits.impact_score` at time of log |
| `reward_pathway_snapshot`| TEXT | **[V3 New]** Copy of `habits.reward_pathway` at time of log |

### Ancillary Tables
- `health_metrics`: Stores 'Sleep Score', 'HRV', 'Readiness' (imported from Oura/Whoop).
- `experiments`: Tracks temporary interventions (e.g., "No Caffeine Week").

## 3. Core Mechanisms

### A. The Snapshot Engine
When a use completes a habit, we do **not** just link to the habit ID. We **snapshot** the critical metadata (`energy_cost`, etc.) into the log.
- **Why?** If the user changes a habit from "Easy" (Cost 1) to "Hard" (Cost 10) next month, their historical data from today should still read "Cost 1".
- **Implementation**: See `habitService.logHabit()`.

### B. Protocol-Based Metrics (V3)
Dashboard metrics allow the user to see the "Big Picture" of their design.
- **Daily System Load**: Sum of `energy_cost` of all **Active Habits**. (Predicted Load).
- **Rewards Profile**: Distribution of `reward_pathway` of all **Active Habits**. (Designed Chemistry).
- **Neuroplasticity**: Weighted average of **Streaks** (Execution-based).

## 4. Security (RLS)
Row Level Security is ENABLED on all tables.
- **Start Up**: `npm run dev`
- Policies ensure users can only Select/Insert/Update/Delete their **own** data (`auth.uid() = user_id`).
