# Helm App Delivery Kit

This project bundles a simple Node.js service with a reusable Helm chart so platform teams can roll it into any cluster. It demonstrates how I pair application code, deployment templates, and CI checks to prevent drift.

## What lives here

| Path | Description |
| --- | --- |
| `app/` | Express service exposing `/healthz` and `/api/message`. Includes eslint + node tests so templates never ship unverified builds. |
| `helm/app-chart/` | Helm chart with Deployment, Service, ConfigMap, and Ingress templates. `values.yaml` captures image tags, replica counts, probe settings, and environment-specific settings. |

## Local development

```bash
cd app
npm install
npm test
npm run dev
```

Override the message:

```bash
APP_MESSAGE="Welcome from staging" npm run dev
```

## Helm workflow

```bash
helm dependency update helm/app-chart
helm lint helm/app-chart
helm template retail helm/app-chart
```

To install in a cluster:

```bash
helm upgrade --install retail-app helm/app-chart \
  --namespace retail --create-namespace \
  --set image.repository=ghcr.io/kennethfeh/helm-app \
  --set image.tag=$(git rev-parse --short HEAD)
```

Map the ingress host (`retail-app.local`) via DNS or `/etc/hosts` to reach the service.

## CI/CD expectations

The `helm_app_delivery` job in `.github/workflows/portfolio.yml`:

1. Installs Node dependencies under `app/` and runs lint/tests.
2. Installs Helm using `azure/setup-helm@v3`.
3. Runs `helm lint` and `helm template` to ensure chart syntax is valid before promotion.

## Operations guidance

- Update `values.yaml` with environment-specific overrides (replicas, resource requests, ingress hosts).
- Config changes can be rolled out via `helm upgrade` while the app code stays untouched.
- Because the service is tiny, it is safe to replicate the pattern for multiple workloads—swap the container reference and ConfigMap data, keep the CI gates untouched.
