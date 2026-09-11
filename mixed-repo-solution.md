# Mixed-repo sync (PC ↔ laptop)

> Decision note — pick an option on the PC, then set it up once.  
> Goal: sync **plans / docs / `.marshal` / `.cursor`** between machines without putting secrets or private notes in the **public** app repo.

## Problem

| Path | Synced by public git today? |
| ---- | --------------------------- |
| `apps/web/` (this repo) | Yes |
| `Plans/` | No — outside this repo |
| `docs/` | No |
| `.marshal/` | No |
| `.cursor/` | No |

Git only lives under `apps/web/`. Workspace folders next to it never travel with `git pull`.

## Target layout

```text
Invite_Project/                 ← private repo (root)
  .cursor/
  .marshal/
  docs/
  Plans/
  apps/web/                     ← public repo (nested) — date-invite-app
```

| Repo | Tracks |
| ---- | ------ |
| **Private** (`Invite_Project`) | `.cursor/`, `.marshal/`, `docs/`, `Plans/` (+ how `apps/web` is linked) |
| **Public** (`apps/web`) | Next app only (current GitHub repo) |

Do **not** commit the same `apps/web` files as normal files in the private repo while `apps/web` also has its own `.git`. That nested-repo trap causes double tracking and sync pain.

---

## Option A — Private ignores `apps/web` (simplest)

**Idea:** Private repo never tracks app code. App keeps syncing only via the public repo.

### Private `.gitignore` (root) should include at least

```gitignore
apps/web/
# optional even in private:
docs/.secret/
**/node_modules/
**/.env
**/.env.*
!**/.env.example
```

### Day-to-day

| Change | Where | Push |
| ------ | ----- | ---- |
| App code | `apps/web` | Public remote |
| Plans / docs / DB scripts / Cursor rules | `Invite_Project` root | Private remote |

### On each machine

1. Clone/pull **private** → `Invite_Project`
2. Clone/pull **public** → `Invite_Project/apps/web` (if not already there)

### Pros / cons

- Pros: easy mental model; no submodules  
- Cons: two pulls every time you switch machines

---

## Option B — `apps/web` as a git submodule (one controlled clone)

**Idea:** Private repo stores a **pointer** (commit SHA) to the public repo at `apps/web`.

### Setup sketch

```bash
# from Invite_Project (private repo, apps/web not yet a nested clone)
git submodule add https://github.com/HesamMarshal/date-invite-app.git apps/web
git commit -m "Add apps/web as submodule"
git push
```

### Clone on the other machine

```bash
git clone --recurse-submodules <private-repo-url> Invite_Project
# or later:
git submodule update --init --recursive
```

### Day-to-day

1. Work in `apps/web` → commit & push **public**
2. In private root: `git add apps/web` → commit submodule SHA → push **private**

### Pros / cons

- Pros: private clone can bring app + notes together; pin exact app revision  
- Cons: extra step (update submodule pointer); easy to forget

---

## What to ignore even in the private repo

- `docs/.secret/` — passwords / API keys (prefer not in git at all)
- `apps/web/node_modules`, `apps/web/.next`, `apps/web/.env*`
- Build / log junk

`.marshal/` **may** live in the **private** repo (that is the main win for PC ↔ laptop). Keep the private repo **private**.

---

## Recommendation

- Prefer **Option A** if you want the least new git concepts.  
- Prefer **Option B** if you want one private clone to pull notes + a pinned app checkout.

Avoid: one private monorepo that also commits full `apps/web` tree **and** keeps `apps/web` as a separate public repo without submodule/ignore.

---

## Decision checklist (fill on PC)

- [ ] Option A or Option B?
- [ ] Private remote created? (URL: ________________)
- [ ] Public repo stays public? (yes / make private later)
- [ ] Include `.marshal/` in private? (recommended: yes)
- [ ] Include `docs/.secret/` in private? (recommended: no — copy manually / password manager)
- [ ] Laptop: first successful pull of both remotes done?
