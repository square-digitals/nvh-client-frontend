@AGENTS.md

# Claude Rules — NVH Admin Backend

## Branch Policy

- All new features must be developed on the `dev` branch.
- You may only commit or push to the `dev` branch.
- Never commit or push directly to `staging`, `main`, `master`, or `13.x`.
- Before making any commit, verify the current branch with `git branch --show-current`.
- If you are not on `dev`, stop and ask the user before proceeding.

## Workflow

- The branching flow is: `dev` → `staging` → `prod`.
- `dev` is where all active development happens.
- `staging` receives merges from `dev` for testing.
- `prod` (or `main`/`13.x`) receives merges from `staging` only after approval.
- Before starting any work on `dev`, always pull the latest changes: `git checkout dev && git pull origin dev`.

## Push Policy

- Never push to GitHub without explicit approval from the user.
- After committing, always present the changes and wait for the user to test and confirm before running `git push`.
- Only push when the user says so (e.g. "push it", "go ahead", "push to feature branch").
now
## Documentation Policy

- After implementing any new feature or step, always update `docs/API.md` to document what was built and how the API works.
- Documentation must be committed in the same step as the feature code — never skip it.
- `docs/API.md` must include: endpoint method + path, description, required headers, request body (if any), and example response.

