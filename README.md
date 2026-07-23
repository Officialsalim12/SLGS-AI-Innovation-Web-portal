# SLGS AI Innovation & Robotics Competition

Site + API for the Sierra Leone Grammar School AI Innovation Bootcamp & Challenge.

We're **KNS** — we run the platform. **SLGS** is our partner school.

## About

Four week programme: two weeks bootcamp with instructors, then two weeks building in teams with mentors.

Roles:

- **Participants** — team, workspace, kanban, chat, submit project
- **Mentors** — assigned teams, mentorship chat, reviews
- **Admins** — users, teams, mentors, announcements, scores, submissions

## Features

- Auth with email verification (Brevo)
- Separate portals per role
- Teams, mentor assignment, team lock
- Workspace, kanban, team + mentor chat
- Project submission (links and uploads)
- Announcements, notifications, leaderboard
- Terms + Privacy (must accept to sign in / register)

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind, Framer Motion
- Backend: Node.js, Prisma
- DB: PostgreSQL (Neon live; Docker on 5433 locally)
- Email: Brevo
- Auth: JWT + bcrypt

## Setup

Need Node 18+, npm. Docker only if you want local Postgres.

```bash
git clone <your-repo-url>
cd "GHS Hackathon"
npm run install:all
```

### Env

`backend/.env`:

```
DATABASE_URL=postgresql://...
JWT_SECRET=put-a-long-random-string-here
NODE_ENV=development
PORT=4000

BREVO_API_KEY=
BREVO_SENDER_EMAIL=salim@kns.sl
BREVO_SENDER_NAME=KNS and SLGS AI Innovation Bootcamp & Challenge
```

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### DB

```bash
npm run db:up
cd backend
npm run db:push
```

Or point `DATABASE_URL` at Neon and run `db:push` there.

Seed is optional (don't use it if you're live with an empty DB):

```bash
cd backend
npm run db:seed
```

### Run

```bash
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

Check: `GET http://localhost:4000/health`

## Layout

```
.
├── frontend/          # Next app
│   ├── src/app/
│   ├── src/components/
│   └── src/lib/
├── backend/           # API
│   ├── src/
│   └── prisma/
├── docker-compose.yml
└── README.md
```

Terms / privacy are pages: `/terms` and `/privacy`.

## Permissions

| Role        | Access |
|-------------|--------|
| Participant | Own team tools + submission |
| Mentor      | Assigned teams + reviews |
| Admin       | Everything |

## Commands

| Command | Does |
|---------|------|
| `npm run dev:frontend` | Next |
| `npm run dev:backend` | API |
| `npm run db:up` | Start local Postgres |
| `npm run db:down` | Stop it |
| `npm run db:migrate` | Migrations |
| `npm run db:seed` | Sample data |
| `npm run db:studio` | Prisma Studio |

## Contributing

Fork → branch → commit → PR. Don't push `.env` or secrets.

## Legal

- Terms: `/terms`
- Privacy: `/privacy`

## License

Private for this programme. Ask before sharing the repo.

## Contact

KNS · partner SLGS

- Email: salim@kns.sl
- WhatsApp: +232 79 594 218
- Address: 18 Dundas Street, Freetown, Sierra Leone
