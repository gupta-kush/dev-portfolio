# Resume auto-sync setup

This portfolio pulls the latest `Kush_Gupta_resume.pdf` from the
private [`gupta-kush/kush-gupta-resume`][resume-repo] repo at deploy
time. When that repo gets a new resume, it fires a
`repository_dispatch` event at this repo, which triggers a fresh
build. End-to-end latency from a resume push to live on
https://kushgupta.dev: **~60–90 seconds**.

The sync step is gated by a secret-presence check, so the build
falls back to the committed `public/resume.pdf` until you complete
the steps below.

[resume-repo]: https://github.com/gupta-kush/kush-gupta-resume

## One-time setup (~5 minutes)

You'll create **one** fine-grained PAT, install it as a secret in
both repos, and drop a tiny workflow into the resume repo. That's
it.

### 1. Create the fine-grained PAT

Go to https://github.com/settings/personal-access-tokens/new and fill in:

| Field | Value |
|---|---|
| Token name | `Resume sync` (or anything memorable) |
| Resource owner | your account (`gupta-kush`) |
| Repository access | **Only select repositories** → tick both `gupta-kush/dev-portfolio` *and* `gupta-kush/kush-gupta-resume` |
| Repository permissions → Contents | **Read and write** |
| Expiration | up to 1 year (GitHub's max); set a calendar reminder to rotate |

Click **Generate token**. Copy the value — it's only shown once.

> **Scope trade-off**: fine-grained PATs apply one permission set
> across all selected repos, so this token can technically write to
> the resume repo too — broader than the sync strictly needs. That's
> the cost of using one token instead of two. If you want strict
> least-privilege, fall back to the two-PAT setup (see git history
> for the prior version of this doc) — that needs `Contents: Read`
> on the resume repo and `Contents: Write` on the portfolio repo,
> separately.

### 2. Add the same token as a secret in both repos

The fastest path is `gh` CLI — you'll be prompted to paste the token,
it never leaves your terminal:

```bash
gh secret set RESUME_SYNC_TOKEN -R gupta-kush/dev-portfolio
gh secret set RESUME_SYNC_TOKEN -R gupta-kush/kush-gupta-resume
```

Or via the browser:
- **dev-portfolio** → Settings → Secrets and variables → Actions → "New repository secret" → Name `RESUME_SYNC_TOKEN`, value = the PAT
- **kush-gupta-resume** → same UI, same name and value

### 3. Drop the notify workflow into the resume repo

Create `.github/workflows/notify-portfolio.yml` in `kush-gupta-resume`:

```yaml
name: Notify portfolio of resume update

on:
  push:
    paths:
      - Kush_Gupta_resume.pdf
    branches: [main]

# Workflow only fires an API call at the portfolio repo; it doesn't
# touch this repo's contents.
permissions: {}

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Fire repository_dispatch at portfolio
        env:
          GH_TOKEN: ${{ secrets.RESUME_SYNC_TOKEN }}
        run: |
          curl -sSL --fail-with-body \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GH_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            https://api.github.com/repos/gupta-kush/dev-portfolio/dispatches \
            -d '{"event_type":"resume-updated"}'
```

Commit it on `main`. Setup complete.

### 4. (Optional) Delete the loose PDF from this repo

The untracked `Kush_Gupta_resume.pdf` in the portfolio root is now
redundant — the canonical resume lives in `kush-gupta-resume`. Safe
to delete:

```bash
rm Kush_Gupta_resume.pdf
```

The committed `public/resume.pdf` stays as a safety net: if the
sync ever fails, the previously-deployed PDF keeps serving so the
page never 404s.

## How the wiring fits together

```
resume repo                          portfolio repo
─────────────                        ──────────────
push Kush_Gupta_resume.pdf
   │
   ▼
notify-portfolio.yml
   │  curl POST /dispatches
   │  (auth: RESUME_SYNC_TOKEN)
   └──────────────────────────────► repository_dispatch
                                       │  type: resume-updated
                                       ▼
                                    deploy.yml runs
                                       │  sparse-checkout
                                       │  (auth: RESUME_SYNC_TOKEN)
                                       │  cp → public/resume.pdf
                                       │  npm run build
                                       ▼
                                    GitHub Pages
                                       │
                                       ▼
                                    https://kushgupta.dev/resume.pdf
```

## Verifying

After the setup above, push a one-character whitespace change to
`Kush_Gupta_resume.pdf` in the resume repo (or just re-save the
file with a tiny edit and commit). You should see:

1. **Resume repo Actions tab** → `Notify portfolio of resume update`
   runs and goes green within ~10 s.
2. **Portfolio repo Actions tab** → `Deploy to GitHub Pages` starts,
   triggered by `repository_dispatch`. The log will show "Resume
   sync ENABLED — pulling latest…" in the early steps.
3. **Live**: `https://kushgupta.dev/resume.pdf` serves the new file
   within ~1–2 minutes total.

If step 2 logs "RESUME\_SYNC\_TOKEN not set — using committed
public/resume.pdf as fallback", you missed adding the secret to the
portfolio repo. Re-check step 2 of setup.

## Costs

Free.

- This (portfolio) repo is public → unlimited GitHub Actions minutes
  on the free tier.
- The resume repo is private → 2,000 free minutes/month. Each
  dispatch is a single API call (~5 s of compute), so even 100
  resume updates a year is well under 1% of the quota.
- Fine-grained PATs are free.

## Rotating the token

When the PAT expires, both workflows will fail with an auth error.
Generate a new token with the same scopes and update the secret in
both repos (one `gh secret set` per repo, same as setup step 2). Set
a calendar reminder a week before expiry — the date is visible at
https://github.com/settings/tokens?type=beta.
