## Contributing

### Branch naming
Format: `<type>/<issue-number>-<short-description>`
- `feature/12-add-client-form`
- `fix/18-reminder-due-date`
- `chore/5-prisma-setup`

`main` only changes through Pull Requests (no direct pushes).

### Pull request rules
- Every PR links an issue (`Closes #12`) and covers one issue only.
- A teammate reviews it when available; otherwise self-review against the Definition of Done.
- `npm run build` and `npm run lint` pass.
- No secrets or `.env` files committed.
- Prisma schema changes include a migration.
- Squash and merge with a clear message.

### Definition of Done
- [ ] Acceptance criteria in the issue are met
- [ ] Code reviewed and merged to `main`
- [ ] Build and lint pass, no console errors
- [ ] Prisma changes include a migration
- [ ] NFRs that apply (HTTPS, parameterized queries, escaped output, 375px layout) are respected
- [ ] README/docs updated if behavior changed
- [ ] Issue closed and moved to Done on the board

## Environment variables
Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

Secrets for production live in the hosting provider's Variables (Railway), not in the repo.
The seed script creates demo users with a demo-only password; change it before any real deployment.

## Database
```
npx prisma migrate dev   # apply migrations
npx prisma generate      # generate the client
npx prisma db seed       # load demo data
```
