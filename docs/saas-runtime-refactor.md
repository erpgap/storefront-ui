# SaaS Runtime Refactor Plan (stability-first)

## Goal

Remove fragile compiled-bundle patching while preserving:

1. SaaS multi-tenant runtime (per-instance Redis/Odoo settings), and
2. self-hosted compatibility with the same image and codebase.

## Non-goals

- No production-style big-bang rewrite.
- No immediate removal of current runtime patch path.

## Current state (kept for now)

SaaS startup uses `.docker/runtime-config.saas.mjs` to patch Nitro build output
with the runtime Redis URL before server start.

This remains the fallback path until native runtime storage wiring is validated.

## Guardrails

- Feature-flag all new behavior.
- Default flags must preserve current behavior.
- Rollout via canary instances first.
- Keep fast rollback path (`ALOKAI_IMAGE` pin + instance redeploy).

## Proposed phased rollout

### Phase A — Baseline and instrumentation (no behavior change)

- Keep current startup path as default.
- Add explicit startup logs for:
  - chosen mode (`legacy-patch` vs `native-runtime`),
  - resolved Redis URL host,
  - slug bootstrap success/failure.
- Add smoke checklist for create -> health -> callback -> push -> cache-flush.

### Phase B — Native runtime path behind flag

- Introduce runtime flag (off by default), e.g. `RUNTIME_NATIVE_STORAGE=1`.
- Implement native runtime storage wiring path.
- Keep legacy patch path available as fallback.

### Phase C — Canary validation

- Enable flag for a small canary subset.
- Validate:
  - `/web/health`
  - callback to Odoo (`/zeppln/instance-ready`)
  - stock/slugs push
  - `/api/internal/redis/cache-flush-ttl`

### Phase D — Default switch and cleanup

- Make native runtime path default after stable canary window.
- Keep legacy fallback for one transition window.
- Remove legacy patching path in a dedicated cleanup PR.

## Rollback

If any regression appears:

1. Set previous known-good image in Worker `ALOKAI_IMAGE`.
2. Redeploy Worker.
3. Run super-admin "Delete + redeploy" for affected instances.

## Acceptance criteria

- SaaS instances boot without compiled bundle rewrites in default path.
- Self-hosted deployments continue to work unchanged.
- Existing admin recovery tools and diagnostics continue to pass tests.
