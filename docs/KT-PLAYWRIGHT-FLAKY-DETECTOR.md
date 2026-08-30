# KT Document: Playwright + Flaky Test Detector Integration

Date: 2026-08-30
Project: Advance-Playwright-Framework-main

## 1. Objective

This document captures the exact setup we completed to connect a Playwright test project to a flaky test detection backend and trigger it through GitHub Actions.

The goal was to build a working demo pipeline where:

- Playwright tests run in GitHub Actions
- Test results are collected
- The results are sent to the detector backend
- The detector backend stores and displays flaky test results
- Secrets remain secure and are never hardcoded into the repository

---

## 2. What was built

We connected:

1. The Playwright repository in GitHub
2. A hosted backend service (Render) running the flaky test detector
3. A GitHub Actions workflow that sends JUnit XML output to the detector

This is the end-to-end flow:

```text
Playwright project
        ↓
GitHub Actions workflow
        ↓
Run Playwright tests
        ↓
Generate result file (JUnit XML)
        ↓
POST results to backend API
        ↓
Backend stores dashboard data
        ↓
Dashboard shows flaky test results
```

---

## 3. Repository and workflow used

Repository:
- https://github.com/JNamu12/Advance-Playwright-Framework-main.git

Workflow file created:
- .github/workflows/flaky-detector-demo.yml

This workflow does the following:

- checks out the repo
- sets up Node.js
- installs project dependencies
- installs Playwright browsers
- runs Playwright tests
- sends the test results file to the detector backend using a POST request

---

## 4. Workflow explanation (line by line)

File used:
- .github/workflows/flaky-detector-demo.yml

```yaml
name: Flaky Detector Demo Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch: {}
```

Why this matters:
- The workflow runs automatically when code is pushed to `main`
- It can also be run manually from the GitHub Actions UI

```yaml
jobs:
  build-test-report:
    runs-on: ubuntu-latest
```

Why this matters:
- This tells GitHub to run the job on a fresh Ubuntu virtual machine in the cloud

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4
```

Why this matters:
- GitHub downloads the repository into the CI environment before running commands

```yaml
  - name: Set up Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
```

Why this matters:
- The project is a Node.js/TypeScript Playwright project, so Node must be installed

```yaml
  - name: Install dependencies
    run: npm ci
```

Why this matters:
- Installs the exact package versions defined in the lock file

```yaml
  - name: Install Playwright browsers
    run: npx playwright install --with-deps
```

Why this matters:
- Playwright needs browser binaries and OS dependencies to run correctly in CI

```yaml
  - name: Run Playwright tests
    run: npx playwright test
    continue-on-error: true
```

Why this matters:
- The tests are executed
- Even if tests fail, the job continues so the results can still be sent to the detector

```yaml
  - name: Send results to Flaky Test Detector
    if: always()
    run: |
      curl -X POST "${{ secrets.DETECTOR_URL }}/api/v1/test-runs/ingest-junit" \
        -H "X-API-Key: ${{ secrets.DETECTOR_API_KEY }}" \
        -F "file=@results/junit.xml" \
        -F "source_tool=playwright" \
        -F "commit_sha=${{ github.sha }}"
```

Why this matters:
- This is the key integration step
- It sends the JUnit XML result file to the backend
- It includes the API key for authentication
- It identifies the request as a Playwright run and includes the Git commit SHA

---

## 5. Architecture view

```text
+-----------------------+
| GitHub Repository     |
| Playwright project    |
| + workflow file       |
+----------+------------+
           |
           | push / manual trigger
           v
+-----------------------+
| GitHub Actions        |
| - checkout repo       |
| - setup Node          |
| - install deps        |
| - install browsers    |
| - run Playwright      |
| - send results        |
+----------+------------+
           |
           | HTTPS POST + API key
           v
+-----------------------+
| Flaky Detector API    |
| Render deployment     |
| validates key         |
| stores test runs      |
+----------+------------+
           |
           | dashboard data
           v
+-----------------------+
| Dashboard / UI        |
| shows flaky results   |
+-----------------------+
```

This architecture is the core of the demo: CI runs tests, and the backend stores the results for later inspection.

---

## 6. Why secrets are required

We used GitHub secrets instead of putting values directly in code:

- `DETECTOR_URL`
- `DETECTOR_API_KEY`

This is important because:

- the detector URL is deployment-specific
- the API key must not be visible in the repo
- hardcoded secrets are unsafe and bad practice
- secrets keep the pipeline secure and portable

---

## 7. One-by-one setup process used

### Step 1: Deploy the backend detector service

Goal:
- have a live URL where GitHub Actions can send results

Action:
- deploy the backend app to Render
- confirm the service starts successfully

Output:
- Example URL: `https://flaky-test-detector.onrender.com`

Why:
- GitHub Actions needs a fixed destination for the POST request

---

### Step 2: Configure the backend secret key

Goal:
- allow only trusted requests to send test results

Action:
- set an API key in the backend environment
- store the same value in GitHub secret

Why:
- the backend should reject unauthorised requests

---

### Step 3: Add the workflow file

Goal:
- automate tests and send results

Action:
- create `.github/workflows/flaky-detector-demo.yml`
- include Node setup, dependency install, Playwright test execution, and upload step

Why:
- automation is the full purpose of the GitHub pipeline

---

### Step 4: Add GitHub repository secrets

In GitHub repository:

1. Go to Settings
2. Open Secrets and variables → Actions
3. Click New repository secret
4. Add `DETECTOR_URL`
5. Add `DETECTOR_API_KEY`

Example values:

- DETECTOR_URL = `https://flaky-test-detector.onrender.com`
- DETECTOR_API_KEY = `your-random-secret-key`

Why:
- the workflow uses these values at runtime without exposing them in code

---

### Step 5: Commit and push the project

Commands used:

```bash
git add .
git commit -m "Add CI pipeline for flaky test detector"
git push
```

Why:
- GitHub Actions reads the workflow file only after the repo is updated

---

### Step 6: Trigger the GitHub Action

Action:
- open the GitHub repo
- go to Actions
- click the workflow
- click Run workflow

Why:
- this starts the test execution and sends results to the backend

---

### Step 7: Monitor the build logs

Check each step:

- checkout
- set up Node
- install dependencies
- install browsers
- run tests
- send results

Why:
- this confirms the pipeline is working step by step

---

### Step 8: Check the dashboard

Goal:
- verify that test outputs appear in the detector dashboard

Action:
- open the Render URL or dashboard link
- refresh the page

Why:
- this proves the full chain works end-to-end

---

## 8. Common errors and what they usually mean

### Error 1: GitHub Actions cannot reach the detector URL
Possible cause:
- backend is not deployed or not running
- wrong URL value in `DETECTOR_URL`
- backend service crashed

What to check:
- open the Render URL in a browser
- confirm the app is live
- verify the URL is exact

---

### Error 2: 401 or 403 from the detector API
Possible cause:
- wrong or missing `DETECTOR_API_KEY`
- backend expects a different header name or key format

What to check:
- confirm the same key is stored in both places
- inspect the workflow request header
- verify backend `.env` key name matches the request validation logic

---

### Error 3: `results/junit.xml` file not found
Possible cause:
- Playwright did not generate the JUnit file
- the output path is different in the project config
- the test run failed before file creation

What to check:
- inspect Playwright config for reporter settings
- run locally to confirm the JUnit file path
- ensure the file is created before the upload step runs

---

### Error 4: Workflow runs but dashboard stays empty
Possible cause:
- upload request is sent but backend ignores it
- wrong API endpoint path
- backend expects different payload format

What to check:
- inspect the HTTP request in workflow logs
- confirm the backend endpoint is correct
- validate payload structure with backend docs

---

### Error 5: Tests fail in CI but not locally
Possible cause:
- environment differences
- Playwright browsers missing
- timing issues
- missing system dependencies

What to check:
- install Playwright browsers using `npx playwright install --with-deps`
- inspect screenshot/video/traces if configured
- run the same command locally in CI-like conditions

---

## 9. Important notes and best practices

### Security
- never hardcode secrets into code
- never push `.env` files with real credentials
- always use repository secrets

### Reliability
- use `continue-on-error: true` for the test run step so results still get uploaded
- use `if: always()` for the upload step so the detector sees failed runs too

### Observability
- check the GitHub Actions logs for exact failures
- confirm the backend is reachable before diagnosing workflow problems

---

## 10. Why this process works

The flow is reliable because each piece does one specific job:

- GitHub Actions provides the CI environment
- Playwright executes the actual tests
- JUnit XML captures the results
- The detector API receives the results
- The backend records them for monitoring and reporting

This easily demonstrates how a flaky test detection pipeline can integrate with a modern automation setup.

---

## 12. Prompt summary used during setup

The major prompts used in the overall flow were:

1. "Create a GitHub Actions workflow for Playwright tests to send results to a flaky detector backend"
2. "Add a secure way to send the detector URL and API key via GitHub secrets"
3. "Explain each step of the workflow and why it is needed"
4. "Give the exact setup instructions from backend deployment to workflow trigger"
5. "Explain how to troubleshoot pipeline failures step by step"

These prompts guided the implementation and were converted into practical setup actions.

---

## 13. Troubleshooting checklist

If something breaks, check the following in order:

1. Workflow file path is correct
   - `.github/workflows/flaky-detector-demo.yml`

2. GitHub secrets are present
   - `DETECTOR_URL`
   - `DETECTOR_API_KEY`

3. Render backend is running
   - test the URL manually in a browser

4. The backend API endpoint is valid
   - example: `/api/v1/test-runs/ingest-junit`

5. The API key matches exactly
   - the value in GitHub must match the backend environment key

6. The result file exists before upload
   - Playwright must generate `results/junit.xml`

7. Check the workflow logs
   - look for 4xx/5xx errors or invalid file paths

---

## 11. Final status

This project was successfully set up with:

- GitHub repository initialized and connected
- workflow configured for Playwright + detector integration
- secrets configured in GitHub
- push and run instructions completed
- full demo flow documented for future reuse

This KT document can be used later as a reference for onboarding, training, troubleshooting, or future pipeline changes.
