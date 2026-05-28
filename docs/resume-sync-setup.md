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

## One-time setup

### 1. Create two fine-grained PATs

GitHub → Settings → Developer settings → Personal access tokens →
**Fine-grained tokens** → "Generate new token".

#### Token A — `RESUME_READ_TOKEN` (lives in the portfolio repo)

| Field | Value |
|---|---|
| Resource owner | your account (`gupta-kush`) |
| Repository access | Only select repositories → `gupta-kush/kush-gupta-resume` |
| Repository permissions | **Contents: Read-only** |
| Expiration | up to 1 year (GitHub's max); set a calendar reminder to rotate |

#### Token B — `PORTFOLIO_DISPATCH_TOKEN` (lives in the resume repo)

| Field | Value |
|---|---|
| Resource owner | your account (`gupta-kush`) |
| Repository access | Only select repositories → `gupta-kush/dev-portfolio` |
| Repository permissions | **Contents: Read and write** *(required by the `repository_dispatch` API for fine-grained tokens)* |
| Expiration | same |

> Why two tokens? Principle of least privilege — each side gets only
> what it needs. One token with broad scope on both repos would also
> work, but is harder to audit.

### 2. Add the secrets

#### In `dev-portfolio` (this repo)
GitHub → Settings → Secrets and variables → Actions → "New repository secret"
- **Name:** `RESUME_READ_TOKEN`
- **Value:** paste Token A

#### In `kush-gupta-resume`
Same UI, that repo.
- **Name:** `PORTFOLIO_DISPATCH_TOKEN`
- **Value:** paste Token B

### 3. Add the notify workflow to the resume repo

Create `.github/workflows/notify-portfolio.yml` in `kush-gupta-resume`
with this content:

```yaml
name: Notify portfolio of resume update

on:
  push:
    paths:
      - Kush_Gupta_resume.pdf
    branches: [main]

# This workflow doesn't read or write its own repo — it only
# fires an event at the portfolio repo via PAT.
permissions: {}

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Fire repository_dispatch at portfolio
        env:
          GH_TOKEN: ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}
        run: |
          curl -sSL --fail-with-body \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GH_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            https://api.github.com/repos/gupta-kush/dev-portfolio/dispatches \
            -d '{"event_type":"resume-updated"}'
```

Commit it on `main`. Done.

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
   │  (auth: PORTFOLIO_DISPATCH_TOKEN)
   └──────────────────────────────► repository_dispatch
                                       │  type: resume-updated
                                       ▼
                                    deploy.yml runs
                                       │  sparse-checkout
                                       │  (auth: RESUME_READ_TOKEN)
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

If step 2 logs "RESUME\_READ\_TOKEN not set — using committed
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

## Rotating tokens

Both PATs have an expiration. When one expires, GitHub Actions runs
will fail with an auth error in the relevant step. Generate a new
token with the same scopes, update the secret in the corresponding
repo, and you're back to green. The expiration date is visible on
the [tokens page][pat-page] — set a calendar reminder a week before.

[pat-page]: https://github.com/settings/tokens?type=beta
