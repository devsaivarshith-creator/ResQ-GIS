# ResQ-GIS Repository Audit

**Review date:** 27 September 2026  
**Scope:** Static review of the checked-out repository, focusing on backend configuration, API behavior, provider integrations, decision-support logic, model training, and container defaults.  
**Method:** Source/configuration inspection only. Tests, builds, live provider calls, and deployment behavior were not run or independently verified.  
**Overall assessment:** The repository contains multiple release-blocking security and decision-integrity risks. Treat it as a demo/prototype until credentials are removed and rotated, TLS verification is restored, and the hazard model and live-data provenance are independently validated.

## Findings

### Critical — Bhuvan API tokens are committed as application defaults

`backend/app/config.py` embeds seven non-empty Bhuvan service token values. They are therefore used whenever environment variables are absent, are exposed to anyone with repository access, and make `/api/bhuvan/status` report configured services as available without proving successful connectivity. The client sends tokens in URL query parameters, which can also place them in upstream/proxy access logs.

**Action:** Revoke/rotate these tokens, remove them from source and repository history as appropriate, default all token settings to empty, inject secrets through deployment secret management, and avoid query-string credentials where the provider supports another method.

### Critical — TLS certificate verification is disabled for Bhuvan requests

`backend/app/providers/bhuvan/bhuvan_api_client.py` creates `httpx.AsyncClient(..., verify=False)` across multiple provider requests. This removes server certificate validation and allows an on-path attacker to observe or alter responses, including requests carrying the embedded tokens. This undermines the trustworthiness of geocoding, routes, facility results, and land-cover data.

**Action:** Restore normal TLS verification; investigate and rotate credentials that may have been sent over these connections.

### High — Shipped database credentials are predictable and database port is published

`docker-compose.yml` hardcodes `resqgis_secret_password` as the database password and publishes PostgreSQL on `5432:5432`. The same credential is embedded in the backend connection string. On a host reachable by untrusted networks, this exposes the database to direct login with a repository-known password.

**Action:** Require a deployment-provided strong secret, fail closed when it is absent in non-demo deployments, and bind the database port to loopback or remove the host port mapping unless external access is required.

### High — API has no visible authentication or authorization boundary

All registered API routers in `backend/app/main.py` are mounted without authentication middleware or route-level dependencies. This includes data endpoints and computational/provider-backed endpoints such as Bhuvan AOI LULC (`POST /api/bhuvan/lulc/aoi`) and terrain analysis (`POST /api/terrain/analyze`). CORS does not provide authentication. If deployed beyond a trusted network, callers can access the exposed data and consume provider resources.

**Action:** Define the intended trust boundary and add authentication/authorization and abuse controls before exposing the service beyond a trusted local environment.

### High — Hazard model evaluation does not support the stated operational accuracy

`backend/app/intelligence/models/train_model.py` synthesizes most feature values for observed events and generates negative controls from sampled distributions rather than verified non-event observations. It then randomly splits those generated rows and reports conventional test metrics. The test suite asserts ROC-AUC above 0.80, but this setup does not establish predictive performance on independent real-world events or locations; closely related generated records can appear in both splits. The API exposes model metadata as `OPERATIONAL` when the metadata file exists.

**Action:** Do not present current metrics as field validation. Rebuild evaluation around independently sourced, spatially/temporally separated event and non-event data, document label provenance and uncertainty, and clearly gate operational use pending validation.

### High — Prioritization treats evacuation feasibility as increasing urgency

`backend/app/intelligence/prioritization.py` defines every criterion as “higher = more urgent,” including `relocation_feasibility`; TOPSIS consequently rewards habitations that are easier to relocate. That may be a valid operational factor, but it can lower the rank of highly threatened populations with poor access or no safe haven. `backend/app/api/analysis.py` also accepts user-supplied weights without bounds, non-negativity checks, or normalization, so negative or extreme weights can invert or dominate the ranking.

**Action:** Have disaster-management domain owners approve criterion direction and tradeoffs, expose factor-level explanations, validate weight count/range/sum, and assess rankings against documented scenarios before operational use.

### Medium — “Live” provenance and timestamps can overstate freshness

`backend/app/main.py` marks several providers `LIVE` from configuration presence alone (for example, a configured feed URL or token), while `last_updated` is set to the current time at status-query time. This does not show that a fetch succeeded or that the underlying data was updated then. The Bhuvan health endpoint similarly reports service/token configuration status. Operators may mistake configured integrations for current authoritative telemetry.

**Action:** Report connectivity and data freshness separately; derive source status from recent successful fetches and use the source/cache retrieval timestamp. Mark unknown or stale feeds explicitly.

### Medium — Dynamic assessment errors are silently hidden

`backend/app/api/habitations.py` and `backend/app/api/relocation.py` catch broad exceptions during enrichment and return the original records without surfacing the failed calculation. In a decision-support interface this can silently present static scores as if dynamic assessment succeeded, especially when provenance is not updated on failure.

**Action:** Log failures with request/source context and return explicit assessment status, error/staleness metadata, and provenance so the client can distinguish fallback values from successful calculations.

## Positive observations

- `.env.example` uses blank values for most optional provider credentials and documents demo mode.
- CORS origins are explicitly configured rather than wildcarded by default.
- Several provider clients set finite request timeouts, and the database connection uses a short connection timeout.
- The project has a backend test suite covering selected API, spatial, model, and normalization behavior, though this review did not execute it.

## Audit limitations

This report is based on repository source and configuration only. It does not establish whether the exposed defaults or tokens are active, whether the deployment is internet-accessible, whether current feeds are reliable, or whether the model performs adequately on external data. No tests or builds were run. Findings should be verified against the deployment environment and operational requirements before release.
