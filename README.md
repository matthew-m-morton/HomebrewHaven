# Homebrew Haven

> **Development README.** This is a working README for while the project is in progress, so my instructor can follow the direction and reasoning. The final version, with the ERD image, test accounts, and known limitations, will replace it in the last commit.

Homebrew Haven is a server-rendered web app where Dungeon Masters and players build a library of homebrew D&D 5e content and control which of it each campaign allows.

**Live site:** _add Render URL_

## Who it's for

- **DMs** who run campaigns with homebrew content and want one place to decide what's allowed at their table.
- **Players** who want to write their own spells, items, or races and propose them to their DM.
- **Anyone** browsing for ideas: public entries are searchable without an account.

## Core ideas

- **Entries**: five content types (spells, items, monsters, classes, races), each with its own table.
- **Visibility**: entries are private by default. Publishing runs a profanity filter. Public entries join a shared search pool that guests can browse; logged-in users can rate them and copy them into their own collection.
- **Parties and campaigns**: users create parties and invite others by friend code. Whoever creates a campaign is its DM and controls its whitelist. Players can request entries be added.
- **Moderation**: a report hides an entry immediately. The owner can edit it and appeal, and a moderator decides. Profanity false positives (for example, *Cockatrice*) go through an override request.

## Roles

| Role | Level | Can do |
| --- | --- | --- |
| Guest | Site | Browse and search public entries |
| Standard User | Site | Create, edit, copy, publish, rate, report, appeal; create parties and campaigns; delete own account |
| Moderator | Site | Everything a user can, plus review reports, appeals, override requests, and category requests |
| Admin | Site | Everything a moderator can, plus manage users and roles, filter word lists, Official entries, and stats |
| DM | Campaign | Manage the campaign whitelist; approve or deny player requests |
| Player | Campaign | View the campaign; submit and withdraw whitelist requests |

DM and Player are roles inside a single campaign, so the same user can be a DM in one campaign and a player in another.

## Stack

Node.js + Express 5, EJS with layouts and partials, ESM only, PostgreSQL, express-session with a Postgres session store, bcrypt, deployed on Render.

## Progress

| Done | What |
| --- | --- |
| ✅ | Scaffold, folder structure, theme and layout |
| ✅ | Database setup: roles and users tables |
| ✅ | Global error handler, 404 page, dev request logger |
| ✅ | Registration with validation, bcrypt, random friend codes |
| ✅ | Postgres sessions, login and logout, flash messages |
| ✅ | `requireLogin`, `requireRole`, account page |
| 🔨 | Entry tables, category lookup tables, entry model |
| 🔨 | Account deletion with typed confirmation |

Next: entry CRUD, the public search pool, copying, notifications, publishing and the profanity filter, ratings, reports and appeals, parties and campaigns, whitelists, the admin dashboard, security hardening, seed data.

## Design decisions so far

- **Five entry tables instead of one generic table.** Each type has different fields, and separate tables let each field have a real data type and constraint (spell level 0–9, monster CR stored as a number so sorting by CR works). Shared code is driven by a config map, so one set of `/:type/...` routes serves all five.
- **Table and column names come only from a hardcoded config.** Postgres can't use `$1` placeholders for identifiers, so the `:type` URL segment is looked up in a fixed map (with `Object.hasOwn`), never put into SQL directly. All values still use placeholders.
- **"Other" categories.** Spell school, item type, and creature type live in lookup tables instead of CHECK lists, because the lists can grow. Picking "Other" stores the user's own text instead. A CHECK constraint guarantees each entry has exactly one of the two. Users can request that an "Other" become a real category. When a moderator approves, the category is added and every matching entry is moved into it. In dropdowns the original categories come first, then community-added ones, then "Other."
- **Fixed rule lists stay CHECK constraints.** Rarity, size, hit die, and visibility come from the game rules or the app's own lifecycle, so they don't need a table.
- **Category foreign keys use `ON DELETE RESTRICT`.** A category that is in use can't be deleted. SET NULL would leave an entry with no category at all, which the CHECK constraint forbids anyway.
- **Deleting an account cascades.** It removes the user's entries, ratings, and memberships. Copies other users made survive, because `copied_from` is `ON DELETE SET NULL`. Deletion requires typing a confirmation phrase plus the current password, and the last admin can't delete their own account.
- **Status values are enforced in the database** with CHECK constraints, so invalid statuses are impossible even if application code has a bug.
- **Output escaping instead of input escaping.** EJS `<%= %>` escapes on output; escaping input as well would double-escape. `<%-` is never used on user content.
- **No try/catch in controllers.** Express 5 forwards rejected promises to the global error handler. try/catch appears only in models where it's deliberate, such as retrying on a friend-code collision.

## Planned workflows

Each has a status column and a history users can view:

1. **Entry visibility**: private → public, or private → hidden by report → restored or upheld after an appeal.
2. **Reports**: open → under review → resolved or dismissed.
3. **Whitelist requests**: pending → approved, denied, or withdrawn.
4. **Party invites**: pending → accepted, declined, or cancelled.
5. **Category requests**: pending → approved or rejected.

## Running locally

```powershell
npm install
Copy-Item .env.example .env   # then fill in DATABASE_URL and SESSION_SECRET
npm run db:setup
npm run dev
```

## Current limitations

- The Browse link returns a 404 until the search pool is built.
- The home page still has placeholder cards.
- Entries can't be created through the UI yet.