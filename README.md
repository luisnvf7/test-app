# CICD Practice App (AWS)

Small Node.js app to practice **CI/CD on AWS**. It exposes **version** and **build** info so you can confirm which deployment is live.

## Ver la versión / See the version

- **Web:** Open the app in the browser — the homepage shows **Version** and **Build**.
- **API:** `GET /version` returns JSON:
  ```json
  {
    "version": "1.0.0",
    "buildId": "a1b2c3d",
    "env": "production",
    "time": "2025-03-01T12:00:00.000Z"
  }
  ```
- **Health (ALB/ECS):** `GET /health` for load balancer health checks.

## Run locally

```bash
npm start
```

Open http://localhost:3000. Change the version in `package.json` and restart to see it update.

## Docker

```bash
docker build --build-arg BUILD_ID=$(git rev-parse --short HEAD) -t cicd-practice-app .
docker run -p 3000:3000 cicd-practice-app
```

## CI/CD with GitHub Actions + AWS

The workflow `.github/workflows/aws-cicd.yml` on push to `main`/`master`:

1. Builds the Docker image with `BUILD_ID=$GITHUB_SHA`.
2. Pushes to **Amazon ECR**.

### Setup

1. **Create an ECR repository** (once):
   ```bash
   aws ecr create-repository --repository-name cicd-practice-app --region us-east-1
   ```

2. **GitHub secrets** (Settings → Secrets and variables → Actions):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

3. Push to `main` or `master`; the workflow will build and push the image. The **version** you see in the app comes from `package.json` and the **build** from the git commit SHA.

### Deploy the image (ECS, App Runner, etc.)

After the image is in ECR you can:

- **ECS/Fargate:** Create a task definition that uses the ECR image and deploy via service (console, CLI, or another workflow step).
- **App Runner:** Create an App Runner service from the ECR repository.
- **Other:** Use the same image in any AWS service that runs Docker (e.g. Lambda with container image).

## Changing the version

- **App version:** Edit `version` in `package.json` (e.g. `1.0.0` → `1.1.0`).
- **Build identifier:** Set by CI (`GITHUB_SHA`) or at build time with `--build-arg BUILD_ID=...`. The app shows it in the UI and in `/version` and `/health`.
