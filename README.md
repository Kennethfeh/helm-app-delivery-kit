# Helm App Delivery Kit

Packaged example showing how application code, Helm templates, and CI checks can live together. It ships a minimal Express API plus a reusable Helm chart so teams can roll the workload into any Kubernetes cluster without copy/paste drift.

## Why this exists

- Demonstrate how platform teams expose a golden chart alongside the service it deploys.
- Capture best practices around health probes, config management, and CI linting in one repo.
- Provide a starting point for onboarding new services to Kubernetes.

## Repository structure

| Path | Highlights |
| --- | --- |
| `app/` | Express service exposing `/healthz` and `/api/message`. Includes linting, unit tests, Dockerfile, and development scripts. |
| `helm/app-chart/` | Helm chart that renders Deployment, Service, ConfigMap, and optional Ingress. Values control replica counts, resources, probes, environment variables, and hostnames. |
| `.github/workflows/portfolio.yml` | `helm_app_delivery` job installs Node deps, runs tests, and validates the Helm chart (`helm lint`, `helm template`). |

## Prerequisites

- Node.js 18+
- npm
- Helm 3.11+
- Access to a Kubernetes cluster (kind, k3d, AKS/EKS/GKE) for installs

## Local application workflow

```bash
cd app
npm install
npm test
npm run dev
```

Hit http://localhost:3000/api/message or override the message:

```bash
APP_MESSAGE="Hello from staging" npm run dev
```

## Helm usage

```bash
helm dependency update helm/app-chart
helm lint helm/app-chart
helm template retail helm/app-chart
```

Deploy into a cluster:

```bash
helm upgrade --install retail-app helm/app-chart \
  --namespace retail --create-namespace \
  --set image.repository=ghcr.io/kennethfeh/helm-app \
  --set image.tag=$(git rev-parse --short HEAD) \
  --set config.appMessage="Retail from prod"
```

Configure `/etc/hosts` or DNS for the ingress host defined in `values.yaml` (default `retail-app.local`).

## Notable values

| Value | Purpose |
| --- | --- |
| `replicaCount` | Pod replicas per environment. |
| `image.repository/tag` | Container image to deploy. Bind to your registry or GitHub Container Registry. |
| `config.appMessage` | String stored in a ConfigMap and read by the API to display environment context. |
| `ingress.*` | Enable/disable ingress, hostnames, TLS annotations. |
| `resources` | Requests/limits for CPU and memory. |
| `livenessProbe` / `readinessProbe` | HTTP probe paths and thresholds. |

## CI pipeline expectations

The `helm_app_delivery` job executes whenever the parent portfolio workflow runs:

1. `npm ci && npm test` inside `app/`.
2. Install Helm via `azure/setup-helm`.
3. `helm lint` to catch syntax errors.
4. `helm template` to render manifests and ensure templates stay valid.

## Operational notes

- Treat `values.yaml` as the base; create environment-specific overrides (e.g., `values-prod.yaml`).
- Add `ServiceMonitor` or `PodDisruptionBudget` templates under `helm/app-chart/templates/` as you harden the service.
- Extend `app/` with additional endpoints or dependencies while the chart remains stable.

Use this project as a teaching aid or bootstrap when onboarding workloads to Kubernetes/Helm.
